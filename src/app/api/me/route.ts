import { handleApiError, ok } from '@/server/modules/api';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { listOrganizationsForUser } from '@/server/modules/organizations/service';

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const organizations = await listOrganizationsForUser(user.id);
    return ok({ user, organizations });
  } catch (error) {
    return handleApiError(error);
  }
}
