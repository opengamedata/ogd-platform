import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { ConflictError, NotFoundError } from '../errors';
import { recordAuditEvent } from '../audit/service';
import { enqueueOutboxEvent } from '../outbox/service';
import { canEnrollService, requireRole } from '../auth/permissions';
import { getMembershipRole } from '../organizations/service';
import { getGameForUser } from '../games/service';
import { getServiceDefinitionByKey, listServiceDefinitions, renderLaunchUrl } from '../serviceCatalog/service';
import type { EnrollmentStatus } from '../sharedTypes';

export async function listServicesForGame(input: { gameId: string; actorUserId: string }) {
  const game = await getGameForUser(input.gameId, input.actorUserId);
  const definitions = await listServiceDefinitions();

  const enrollmentByDefinition = new Map(
    game.serviceEnrollments.map((enrollment) => [enrollment.serviceDefinitionId, enrollment]),
  );

  return definitions.map((definition) => {
    const enrollment = enrollmentByDefinition.get(definition.id) ?? null;
    return {
      definition,
      enrollment,
      handoffUrl:
        enrollment?.serviceResourceUrl ??
        (enrollment ? renderLaunchUrl(definition.launchUrlTemplate, { enrollmentId: enrollment.id, gameId: game.id }) : null),
      status: enrollment?.status ?? 'not_enrolled',
    };
  });
}

export async function createServiceEnrollment(input: {
  gameId: string;
  actorUserId: string;
  serviceKey: string;
}) {
  const game = await getGameForUser(input.gameId, input.actorUserId);
  const role = await getMembershipRole(game.organizationId, input.actorUserId);
  requireRole(role, canEnrollService);

  const definition = await getServiceDefinitionByKey(input.serviceKey);
  if (!definition || definition.status !== 'active') {
    throw new NotFoundError('Service definition was not found.');
  }

  return prisma.$transaction(async (tx) => {
    try {
      const enrollment = await tx.serviceEnrollment.create({
        data: {
          gameId: game.id,
          serviceDefinitionId: definition.id,
          status: 'setup_required',
        },
        include: { serviceDefinition: true },
      });

      await recordAuditEvent(
        {
          actorUserId: input.actorUserId,
          organizationId: game.organizationId,
          action: 'service_enrollment.created',
          resourceType: 'service_enrollment',
          resourceId: enrollment.id,
          metadata: {
            gameId: game.id,
            serviceKey: definition.serviceKey,
            status: enrollment.status,
          },
        },
        tx,
      );

      await enqueueOutboxEvent(
        {
          eventType: 'ServiceEnrollmentChanged',
          aggregateType: 'service_enrollment',
          aggregateId: enrollment.id,
          payload: {
            enrollmentId: enrollment.id,
            gameId: game.id,
            organizationId: game.organizationId,
            serviceKey: definition.serviceKey,
            status: enrollment.status,
          },
        },
        tx,
      );

      return {
        ...enrollment,
        handoffUrl:
          enrollment.serviceResourceUrl ??
          renderLaunchUrl(definition.launchUrlTemplate, {
            enrollmentId: enrollment.id,
            gameId: game.id,
          }),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('Game is already enrolled in this service.');
      }
      throw error;
    }
  });
}

export async function updateServiceEnrollment(input: {
  enrollmentId: string;
  actorUserId: string;
  status?: EnrollmentStatus;
  serviceResourceId?: string | null;
  serviceResourceUrl?: string | null;
}) {
  const current = await prisma.serviceEnrollment.findUnique({
    where: { id: input.enrollmentId },
    include: { game: true, serviceDefinition: true },
  });

  if (!current || current.game.archivedAt) {
    throw new NotFoundError('Service enrollment was not found.');
  }

  const role = await getMembershipRole(current.game.organizationId, input.actorUserId);
  requireRole(role, canEnrollService);

  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.serviceEnrollment.update({
      where: { id: input.enrollmentId },
      data: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.serviceResourceId !== undefined
          ? { serviceResourceId: input.serviceResourceId }
          : {}),
        ...(input.serviceResourceUrl !== undefined
          ? { serviceResourceUrl: input.serviceResourceUrl }
          : {}),
      },
      include: { serviceDefinition: true },
    });

    await recordAuditEvent(
      {
        actorUserId: input.actorUserId,
        organizationId: current.game.organizationId,
        action: 'service_enrollment.updated',
        resourceType: 'service_enrollment',
        resourceId: enrollment.id,
        metadata: input as unknown as Prisma.InputJsonValue,
      },
      tx,
    );

    await enqueueOutboxEvent(
      {
        eventType: 'ServiceEnrollmentChanged',
        aggregateType: 'service_enrollment',
        aggregateId: enrollment.id,
        payload: {
          enrollmentId: enrollment.id,
          gameId: current.gameId,
          organizationId: current.game.organizationId,
          serviceKey: current.serviceDefinition.serviceKey,
          status: enrollment.status,
        },
      },
      tx,
    );

    return enrollment;
  });
}
