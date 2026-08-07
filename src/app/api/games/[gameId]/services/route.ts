import { handleApiError, ok } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { listServicesForGame } from '@/server/modules/serviceEnrollment/service';

type Context = { params: Promise<{ gameId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { gameId } = await context.params;
    const services = await listServicesForGame({ gameId, actorUserId: user.id });
    return ok({ services });
  } catch (error) {
    return handleApiError(error);
  }
}
