import { created, handleApiError, ok, readJson } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { createGame, listGamesForOrganization } from '@/server/modules/games/service';
import { createGameSchema } from '@/server/modules/validation';

type Context = { params: Promise<{ organizationId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { organizationId } = await context.params;
    const games = await listGamesForOrganization({ organizationId, actorUserId: user.id });
    return ok({ games });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { organizationId } = await context.params;
    const body = createGameSchema.parse(await readJson(request));
    const game = await createGame({
      organizationId,
      actorUserId: user.id,
      name: body.name,
      description: body.description || undefined,
      targetAudience: body.targetAudience || undefined,
      subject: body.subject || undefined,
      thumbnailUrl: body.thumbnailUrl || undefined,
      playUrl: body.playUrl || undefined,
      sourceUrl: body.sourceUrl || undefined,
      studies: body.studies || undefined,
      lifecycleStatus: body.lifecycleStatus,
      privacyClassification: body.privacyClassification,
      releaseStatus: body.releaseStatus,
    });
    return created({ game });
  } catch (error) {
    return handleApiError(error);
  }
}
