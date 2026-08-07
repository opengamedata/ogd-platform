import { prisma } from '@/server/db/prisma';
import { handleApiError, ok } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { canRead, requireRole } from '@/server/modules/auth/permissions';
import { NotFoundError } from '@/server/modules/errors';
import { getGameForUser } from '@/server/modules/games/service';
import { getMembershipRole } from '@/server/modules/organizations/service';
import { getOrganizationForUser } from '@/server/modules/organizations/service';
import { listAuditEvents } from '@/server/modules/audit/service';

type Context = { params: Promise<{ resourceType: string; resourceId: string }> };

async function assertCanReadResource(resourceType: string, resourceId: string, actorUserId: string) {
  if (resourceType === 'organization') {
    await getOrganizationForUser(resourceId, actorUserId);
    return;
  }

  if (resourceType === 'game') {
    await getGameForUser(resourceId, actorUserId);
    return;
  }

  if (resourceType === 'service_enrollment') {
    const enrollment = await prisma.serviceEnrollment.findUnique({
      where: { id: resourceId },
      include: { game: true },
    });
    if (!enrollment) {
      throw new NotFoundError('Service enrollment was not found.');
    }
    const role = await getMembershipRole(enrollment.game.organizationId, actorUserId);
    requireRole(role, canRead);
    return;
  }

  if (resourceType === 'review') {
    const review = await prisma.reviewRecord.findUnique({
      where: { id: resourceId },
      include: { game: true },
    });
    if (!review) {
      throw new NotFoundError('Review was not found.');
    }
    const role = await getMembershipRole(review.game.organizationId, actorUserId);
    requireRole(role, canRead);
    return;
  }

  throw new NotFoundError('Audited resource type was not found.');
}

export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { resourceType, resourceId } = await context.params;
    await assertCanReadResource(resourceType, resourceId, user.id);
    const auditEvents = await listAuditEvents(resourceType, resourceId);
    return ok({ auditEvents });
  } catch (error) {
    return handleApiError(error);
  }
}
