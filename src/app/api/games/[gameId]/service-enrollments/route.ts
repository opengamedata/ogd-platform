import { created, handleApiError, readJson } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { createServiceEnrollment } from '@/server/modules/serviceEnrollment/service';
import { createServiceEnrollmentSchema } from '@/server/modules/validation';

type Context = { params: Promise<{ gameId: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { gameId } = await context.params;
    const body = createServiceEnrollmentSchema.parse(await readJson(request));
    const enrollment = await createServiceEnrollment({
      gameId,
      actorUserId: user.id,
      serviceKey: body.serviceKey,
    });
    return created({ enrollment });
  } catch (error) {
    return handleApiError(error);
  }
}
