import { handleApiError, ok, readJson } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { getGameForUser, updateGame } from '@/server/modules/games/service';
import { updateGameSchema } from '@/server/modules/validation';

type Context = { params: Promise<{ gameId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { gameId } = await context.params;
    const game = await getGameForUser(gameId, user.id);
    return ok({ game });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { gameId } = await context.params;
    const body = updateGameSchema.parse(await readJson(request));
    const game = await updateGame({
      gameId,
      actorUserId: user.id,
      name: body.name,
      description: body.description,
      targetAudience: body.targetAudience,
      subject: body.subject,
      thumbnailUrl: body.thumbnailUrl,
      playUrl: body.playUrl,
      sourceUrl: body.sourceUrl,
      studies: body.studies,
      lifecycleStatus: body.lifecycleStatus,
      privacyClassification: body.privacyClassification,
      releaseStatus: body.releaseStatus,
    });
    return ok({ game });
  } catch (error) {
    return handleApiError(error);
  }
}
