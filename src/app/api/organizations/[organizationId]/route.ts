import { handleApiError, ok, readJson } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import {
  getOrganizationForUser,
  updateOrganization,
} from '@/server/modules/organizations/service';
import { updateOrganizationSchema } from '@/server/modules/validation';

type Context = { params: Promise<{ organizationId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { organizationId } = await context.params;
    const organization = await getOrganizationForUser(organizationId, user.id);
    return ok({ organization });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireCurrentUser();
    const { organizationId } = await context.params;
    const body = updateOrganizationSchema.parse(await readJson(request));
    const organization = await updateOrganization({
      organizationId,
      actorUserId: user.id,
      name: body.name,
    });
    return ok({ organization });
  } catch (error) {
    return handleApiError(error);
  }
}
