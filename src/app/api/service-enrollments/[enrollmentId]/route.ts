import { handleApiError, ok, readJson } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { updateServiceEnrollment } from '@/server/modules/serviceEnrollment/service';
import { updateServiceEnrollmentSchema } from '@/server/modules/validation';

type Context = { params: Promise<{ enrollmentId: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { enrollmentId } = await context.params;
    const body = updateServiceEnrollmentSchema.parse(await readJson(request));
    const enrollment = await updateServiceEnrollment({
      enrollmentId,
      actorUserId: user.id,
      status: body.status,
      serviceResourceId: body.serviceResourceId,
      serviceResourceUrl: body.serviceResourceUrl,
    });
    return ok({ enrollment });
  } catch (error) {
    return handleApiError(error);
  }
}
