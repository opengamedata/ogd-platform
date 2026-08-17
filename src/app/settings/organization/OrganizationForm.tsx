'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Building2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrganizationFormState } from './actions';

type OrganizationFormProps = {
  action: (
    state: OrganizationFormState,
    formData: FormData,
  ) => Promise<OrganizationFormState>;
  cancelHref?: string;
  defaultName?: string;
  organizationId?: string;
  submitLabel: string;
};

const initialState: OrganizationFormState = {};

export function OrganizationForm({
  action,
  cancelHref,
  defaultName,
  organizationId,
  submitLabel,
}: OrganizationFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-xl">
      {organizationId ? <input type="hidden" name="organizationId" value={organizationId} /> : null}

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="organization-name">
          Organization name
        </label>
        <input
          autoComplete="organization"
          autoFocus
          className="h-11 rounded-md border bg-card px-3 text-base text-foreground shadow-ogd-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          defaultValue={defaultName}
          id="organization-name"
          maxLength={120}
          minLength={2}
          name="name"
          placeholder="Field Day Lab"
          required
          type="text"
        />
      </div>

      {state.error ? (
        <p className="mt-3 text-sm font-semibold text-destructive">{state.error}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled={pending} type="submit">
          {submitLabel.toLowerCase().includes('save') ? (
            <Save className="size-4" />
          ) : (
            <Building2 className="size-4" />
          )}
          {pending ? 'Saving...' : submitLabel}
        </Button>
        {cancelHref ? (
          <Button asChild variant="outline">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
