import { prisma } from '@/server/db/prisma';
import { recordAuditEvent } from '../audit/service';
import { canChangeGovernance, canRead, requireRole } from '../auth/permissions';
import { getGameForUser } from '../games/service';
import { getMembershipRole } from '../organizations/service';
import type { ReviewStatus } from '../sharedTypes';

export async function listReviews(input: { gameId: string; actorUserId: string }) {
  const game = await getGameForUser(input.gameId, input.actorUserId);
  const role = await getMembershipRole(game.organizationId, input.actorUserId);
  requireRole(role, canRead);

  return prisma.reviewRecord.findMany({
    where: { gameId: input.gameId },
    orderBy: { createdAt: 'desc' },
    include: { reviewer: true },
  });
}

export async function createReview(input: {
  gameId: string;
  actorUserId: string;
  reviewType: string;
  status: ReviewStatus;
  notes?: string;
}) {
  const game = await getGameForUser(input.gameId, input.actorUserId);
  const role = await getMembershipRole(game.organizationId, input.actorUserId);
  requireRole(role, canChangeGovernance);

  return prisma.$transaction(async (tx) => {
    const review = await tx.reviewRecord.create({
      data: {
        gameId: input.gameId,
        reviewType: input.reviewType,
        status: input.status,
        reviewerUserId: input.status === 'draft' ? null : input.actorUserId,
        notes: input.notes || null,
        decidedAt: ['approved', 'rejected', 'changes_requested'].includes(input.status)
          ? new Date()
          : null,
      },
    });

    await recordAuditEvent(
      {
        actorUserId: input.actorUserId,
        organizationId: game.organizationId,
        action: 'review.created',
        resourceType: 'review',
        resourceId: review.id,
        metadata: {
          gameId: input.gameId,
          reviewType: input.reviewType,
          status: input.status,
        },
      },
      tx,
    );

    return review;
  });
}
