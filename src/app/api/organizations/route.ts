import { createOrganizationSchema } from '@/server/modules/validation';
import { created, handleApiError, ok, readJson } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { createOrganization, listOrganizationsForUser } from '@/server/modules/organizations/service';

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const organizations = await listOrganizationsForUser(user.id);
    return ok({ organizations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = createOrganizationSchema.parse(await readJson(request));
    const organization = await createOrganization({ name: body.name, actorUserId: user.id });
    return created({ organization });
  } catch (error) {
    return handleApiError(error);
  }
}
