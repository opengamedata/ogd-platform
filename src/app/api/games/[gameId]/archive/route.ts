import { handleApiError, ok } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { archiveGame } from '@/server/modules/games/service';

type Context = { params: Promise<{ gameId: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { gameId } = await context.params;
    const game = await archiveGame({ gameId, actorUserId: user.id });
    return ok({ game });
  } catch (error) {
    return handleApiError(error);
  }
}
