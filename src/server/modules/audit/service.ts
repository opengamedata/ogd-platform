import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import type { PlatformAction } from '../sharedTypes';

type AuditInput = {
  actorUserId: string;
  organizationId?: string | null;
  action: PlatformAction;
  resourceType: string;
  resourceId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAuditEvent(input: AuditInput, client: Prisma.TransactionClient = prisma) {
  return client.auditEvent.create({
    data: {
      actorUserId: input.actorUserId,
      organizationId: input.organizationId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      metadataJson: input.metadata ?? {},
    },
  });
}

export async function listAuditEvents(resourceType: string, resourceId: string) {
  return prisma.auditEvent.findMany({
    where: { resourceType, resourceId },
    include: { actor: true },
    orderBy: { occurredAt: 'desc' },
    take: 100,
  });
}
