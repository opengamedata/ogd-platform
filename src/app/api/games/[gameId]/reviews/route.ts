import { created, handleApiError, ok, readJson } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { createReview, listReviews } from '@/server/modules/governance/reviews';
import { createReviewSchema } from '@/server/modules/validation';

type Context = { params: Promise<{ gameId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { gameId } = await context.params;
    const reviews = await listReviews({ gameId, actorUserId: user.id });
    return ok({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { gameId } = await context.params;
    const body = createReviewSchema.parse(await readJson(request));
    const review = await createReview({
      gameId,
      actorUserId: user.id,
      reviewType: body.reviewType,
      status: body.status,
      notes: body.notes || undefined,
    });
    return created({ review });
  } catch (error) {
    return handleApiError(error);
  }
}
