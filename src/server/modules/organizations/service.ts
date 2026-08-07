import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { slugify, appendShortId } from '@/lib/slug';
import { NotFoundError } from '../errors';
import { recordAuditEvent } from '../audit/service';
import { enqueueOutboxEvent } from '../outbox/service';
import {
  canManageOrganization,
  requireRole,
} from '../auth/permissions';

export async function getMembershipRole(organizationId: string, userId: string) {
  const membership = await prisma.organizationMembership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  return membership?.status === 'active' ? membership.role : null;
}

export async function listOrganizationsForUser(userId: string) {
  return prisma.organization.findMany({
    where: {
      archivedAt: null,
      memberships: {
        some: {
          userId,
          status: 'active',
        },
      },
    },
    include: {
      memberships: {
        where: { userId },
      },
      games: {
        where: { archivedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getOrganizationForUser(organizationId: string, userId: string) {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      archivedAt: null,
      memberships: { some: { userId, status: 'active' } },
    },
    include: {
      memberships: true,
      games: {
        where: { archivedAt: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!organization) {
    throw new NotFoundError('Organization was not found.');
  }

  return organization;
}

export async function createOrganization(input: { name: string; actorUserId: string }) {
  const baseSlug = slugify(input.name);

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: input.name,
        slug: appendShortId(baseSlug, crypto.randomUUID()),
        createdById: input.actorUserId,
        memberships: {
          create: {
            userId: input.actorUserId,
            role: 'owner',
            status: 'active',
          },
        },
      },
    });

    await recordAuditEvent(
      {
        actorUserId: input.actorUserId,
        organizationId: organization.id,
        action: 'organization.created',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: { name: input.name },
      },
      tx,
    );

    await enqueueOutboxEvent(
      {
        eventType: 'OrganizationCreated',
        aggregateType: 'organization',
        aggregateId: organization.id,
        payload: { organizationId: organization.id, actorUserId: input.actorUserId },
      },
      tx,
    );

    return organization;
  });
}

export async function updateOrganization(input: {
  organizationId: string;
  actorUserId: string;
  name?: string;
}) {
  const role = await getMembershipRole(input.organizationId, input.actorUserId);
  requireRole(role, canManageOrganization);

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.update({
      where: { id: input.organizationId },
      data: {
        ...(input.name ? { name: input.name } : {}),
      },
    });

    await recordAuditEvent(
      {
        actorUserId: input.actorUserId,
        organizationId: organization.id,
        action: 'organization.updated',
        resourceType: 'organization',
        resourceId: organization.id,
        metadata: { name: input.name },
      },
      tx,
    );

    return organization;
  }).catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('Organization was not found.');
    }
    throw error;
  });
}
