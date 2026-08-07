import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { appendShortId, slugify } from '@/lib/slug';
import { recordAuditEvent } from '../audit/service';
import { enqueueOutboxEvent } from '../outbox/service';
import { NotFoundError } from '../errors';
import {
  canChangeGovernance,
  canCreateGame,
  canRead,
  canUpdateGameMetadata,
  requireRole,
} from '../auth/permissions';
import { getMembershipRole } from '../organizations/service';
import type { GameLifecycleStatus, PrivacyClassification, ReleaseStatus } from '../sharedTypes';
import { validateGovernanceTransition } from '../governance/transitions';

export async function listGamesForOrganization(input: { organizationId: string; actorUserId: string }) {
  const role = await getMembershipRole(input.organizationId, input.actorUserId);
  requireRole(role, canRead);

  return prisma.game.findMany({
    where: { organizationId: input.organizationId, archivedAt: null },
    include: { serviceEnrollments: { include: { serviceDefinition: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getGameForUser(gameId: string, actorUserId: string) {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      organization: true,
      serviceEnrollments: { include: { serviceDefinition: true } },
      reviewRecords: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!game || game.archivedAt) {
    throw new NotFoundError('Game was not found.');
  }

  const role = await getMembershipRole(game.organizationId, actorUserId);
  requireRole(role, canRead);
  return game;
}

export async function createGame(input: {
  organizationId: string;
  actorUserId: string;
  name: string;
  description?: string;
  lifecycleStatus: GameLifecycleStatus;
  privacyClassification: PrivacyClassification;
  releaseStatus: ReleaseStatus;
}) {
  const role = await getMembershipRole(input.organizationId, input.actorUserId);
  requireRole(role, canCreateGame);

  const baseSlug = slugify(input.name);

  return prisma.$transaction(async (tx) => {
    const game = await tx.game.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        slug: appendShortId(baseSlug, crypto.randomUUID()),
        description: input.description || null,
        lifecycleStatus: input.lifecycleStatus,
        privacyClassification: input.privacyClassification,
        releaseStatus: input.releaseStatus,
        createdById: input.actorUserId,
      },
    });

    await recordAuditEvent(
      {
        actorUserId: input.actorUserId,
        organizationId: input.organizationId,
        action: 'game.created',
        resourceType: 'game',
        resourceId: game.id,
        metadata: {
          name: game.name,
          lifecycleStatus: game.lifecycleStatus,
          privacyClassification: game.privacyClassification,
          releaseStatus: game.releaseStatus,
        },
      },
      tx,
    );

    await enqueueOutboxEvent(
      {
        eventType: 'GameCreated',
        aggregateType: 'game',
        aggregateId: game.id,
        payload: {
          gameId: game.id,
          organizationId: game.organizationId,
          actorUserId: input.actorUserId,
        },
      },
      tx,
    );

    return game;
  });
}

export async function updateGame(input: {
  gameId: string;
  actorUserId: string;
  name?: string;
  description?: string;
  lifecycleStatus?: GameLifecycleStatus;
  privacyClassification?: PrivacyClassification;
  releaseStatus?: ReleaseStatus;
}) {
  const current = await getGameForUser(input.gameId, input.actorUserId);
  const role = await getMembershipRole(current.organizationId, input.actorUserId);

  const touchesGovernance =
    input.lifecycleStatus !== undefined ||
    input.privacyClassification !== undefined ||
    input.releaseStatus !== undefined;

  requireRole(role, touchesGovernance ? canChangeGovernance : canUpdateGameMetadata);

  validateGovernanceTransition(current, input);

  return prisma.$transaction(async (tx) => {
    const game = await tx.game.update({
      where: { id: input.gameId },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description || null } : {}),
        ...(input.lifecycleStatus ? { lifecycleStatus: input.lifecycleStatus } : {}),
        ...(input.privacyClassification
          ? { privacyClassification: input.privacyClassification }
          : {}),
        ...(input.releaseStatus ? { releaseStatus: input.releaseStatus } : {}),
      },
    });

    await recordAuditEvent(
      {
        actorUserId: input.actorUserId,
        organizationId: game.organizationId,
        action: touchesGovernance ? 'game.governance_changed' : 'game.updated',
        resourceType: 'game',
        resourceId: game.id,
        metadata: input as unknown as Prisma.InputJsonValue,
      },
      tx,
    );

    await enqueueOutboxEvent(
      {
        eventType: touchesGovernance ? 'GameReleaseStateChanged' : 'GameUpdated',
        aggregateType: 'game',
        aggregateId: game.id,
        payload: {
          gameId: game.id,
          organizationId: game.organizationId,
          actorUserId: input.actorUserId,
        },
      },
      tx,
    );

    return game;
  });
}

export async function archiveGame(input: { gameId: string; actorUserId: string }) {
  const current = await getGameForUser(input.gameId, input.actorUserId);
  const role = await getMembershipRole(current.organizationId, input.actorUserId);
  requireRole(role, canChangeGovernance);

  return prisma.$transaction(async (tx) => {
    const game = await tx.game.update({
      where: { id: input.gameId },
      data: {
        lifecycleStatus: 'archived',
        archivedAt: new Date(),
      },
    });

    await recordAuditEvent(
      {
        actorUserId: input.actorUserId,
        organizationId: game.organizationId,
        action: 'game.archived',
        resourceType: 'game',
        resourceId: game.id,
      },
      tx,
    );

    await enqueueOutboxEvent(
      {
        eventType: 'GameArchived',
        aggregateType: 'game',
        aggregateId: game.id,
        payload: {
          gameId: game.id,
          organizationId: game.organizationId,
          actorUserId: input.actorUserId,
        },
      },
      tx,
    );

    return game;
  }).catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('Game was not found.');
    }
    throw error;
  });
}
