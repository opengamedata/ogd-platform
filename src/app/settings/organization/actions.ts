'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireCurrentUser } from '@/server/modules/auth/session';
import {
  createOrganization,
  updateOrganization,
} from '@/server/modules/organizations/service';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '@/server/modules/validation';

export type OrganizationFormState = {
  error?: string;
};

function formError(error: unknown): OrganizationFormState {
  if (error instanceof ZodError) {
    return { error: error.issues[0]?.message ?? 'Check the organization details.' };
  }

  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: 'Something went wrong. Try again.' };
}

export async function createOrganizationAction(
  _state: OrganizationFormState,
  formData: FormData,
): Promise<OrganizationFormState> {
  try {
    const user = await requireCurrentUser();
    const body = createOrganizationSchema.parse({
      name: formData.get('name'),
    });

    await createOrganization({ name: body.name, actorUserId: user.id });
  } catch (error) {
    return formError(error);
  }

  revalidatePath('/settings/organization');
  redirect('/settings/organization');
}

export async function updateOrganizationAction(
  _state: OrganizationFormState,
  formData: FormData,
): Promise<OrganizationFormState> {
  try {
    const user = await requireCurrentUser();
    const organizationId = String(formData.get('organizationId') ?? '');
    const body = updateOrganizationSchema.parse({
      name: formData.get('name'),
    });

    await updateOrganization({
      organizationId,
      actorUserId: user.id,
      name: body.name,
    });
  } catch (error) {
    return formError(error);
  }

  revalidatePath('/settings/organization');
  redirect('/settings/organization');
}
