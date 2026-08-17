import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Pencil } from 'lucide-react';
import { PlatformShell } from '@/components/PlatformShell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/server/modules/auth/session';
import { listOrganizationsForUser } from '@/server/modules/organizations/service';
import {
  createOrganizationAction,
  updateOrganizationAction,
} from './actions';
import { OrganizationForm } from './OrganizationForm';

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function OrganizationSettingsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const organizations = await listOrganizationsForUser(user.id);
  const organization = organizations[0] ?? null;
  const { mode } = await searchParams;
  const isCreating = !organization && mode === 'create';
  const isEditing = Boolean(organization && mode === 'edit');

  return (
    <PlatformShell activeItem="organization" userEmail={user.primaryEmail}>
      <div className="min-h-svh px-7 py-8">
        <section className="pb-8">
          <p className="font-mono text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Settings
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold leading-none tracking-normal text-foreground md:text-6xl">
                Organization
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Manage the organization profile attached to your Platform account.
              </p>
            </div>
            {organization && !isEditing ? (
              <Button asChild variant="outline">
                <Link href="/settings/organization?mode=edit">
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            ) : null}
          </div>
        </section>

        <Separator />

        {!organization && !isCreating ? (
          <section className="grid max-w-2xl gap-5 py-10">
            <div>
              <h2 className="text-2xl font-bold tracking-normal text-foreground">
                Create your organization
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Your organization owns games, service enrollments, and governance state in the Platform.
              </p>
            </div>
            <Button asChild className="w-fit">
              <Link href="/settings/organization?mode=create">
                <Building2 className="size-4" />
                Create organization
              </Link>
            </Button>
          </section>
        ) : null}

        {isCreating ? (
          <section className="py-10">
            <h2 className="text-2xl font-bold tracking-normal text-foreground">
              New organization
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Start with a name. Additional organization settings can be added later.
            </p>
            <div className="mt-7">
              <OrganizationForm action={createOrganizationAction} submitLabel="Create organization" />
            </div>
          </section>
        ) : null}

        {organization && !isEditing ? (
          <section className="py-10">
            <dl className="grid gap-0">
              <div className="grid gap-2 border-b py-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="text-sm font-semibold text-muted-foreground">Name</dt>
                <dd className="text-base font-semibold text-foreground">{organization.name}</dd>
              </div>
              <div className="grid gap-2 border-b py-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="text-sm font-semibold text-muted-foreground">Role</dt>
                <dd className="capitalize text-base text-foreground">
                  {organization.memberships[0]?.role ?? 'owner'}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}

        {organization && isEditing ? (
          <section className="py-10">
            <h2 className="text-2xl font-bold tracking-normal text-foreground">
              Edit organization
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Update the organization name shown across the Platform.
            </p>
            <div className="mt-7">
              <OrganizationForm
                action={updateOrganizationAction}
                cancelHref="/settings/organization"
                defaultName={organization.name}
                organizationId={organization.id}
                submitLabel="Save changes"
              />
            </div>
          </section>
        ) : null}
      </div>
    </PlatformShell>
  );
}
