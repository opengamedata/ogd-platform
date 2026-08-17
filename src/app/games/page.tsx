import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { PlatformShell } from '@/components/PlatformShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/server/modules/auth/session';
import { listGamesForOrganization } from '@/server/modules/games/service';
import { listOrganizationsForUser } from '@/server/modules/organizations/service';
import { createGameAction } from './actions';
import { GameForm } from './GameForm';

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function GamesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const organizations = await listOrganizationsForUser(user.id);
  const organization = organizations[0] ?? null;
  const { mode } = await searchParams;
  const isCreating = Boolean(organization && mode === 'create');
  const games = organization
    ? await listGamesForOrganization({ organizationId: organization.id, actorUserId: user.id })
    : [];

  return (
    <PlatformShell activeItem="games" userEmail={user.primaryEmail}>
      <div className="min-h-svh px-7 py-8">
        <section className="pb-8">
          <p className="font-mono text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Resources
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold leading-none tracking-normal text-foreground md:text-6xl">
                Games
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                Add and manage games owned by your organization.
              </p>
            </div>
            {organization && !isCreating ? (
              <Button asChild>
                <Link href="/games?mode=create">
                  <Plus className="size-4" />
                  Add game
                </Link>
              </Button>
            ) : null}
          </div>
        </section>

        <Separator />

        {!organization ? (
          <section className="grid max-w-2xl gap-5 py-10">
            <div>
              <h2 className="text-2xl font-bold tracking-normal text-foreground">
                Create an organization first
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Games belong to an organization. Set up your organization before adding a game.
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

        {isCreating && organization ? (
          <section className="py-10">
            <h2 className="text-2xl font-bold tracking-normal text-foreground">Add game</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Start with public game metadata from the existing OGD intake form.
            </p>
            <div className="mt-7">
              <GameForm action={createGameAction} organizationId={organization.id} />
            </div>
          </section>
        ) : null}

        {organization && !isCreating && games.length === 0 ? (
          <section className="grid max-w-2xl gap-5 py-10">
            <div>
              <h2 className="text-2xl font-bold tracking-normal text-foreground">No games yet</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Add the first game for {organization.name}. Pipeline enrollment can happen after the game exists.
              </p>
            </div>
            <Button asChild className="w-fit">
              <Link href="/games?mode=create">
                <Plus className="size-4" />
                Add game
              </Link>
            </Button>
          </section>
        ) : null}

        {organization && !isCreating && games.length > 0 ? (
          <section className="py-8">
            <div className="grid">
              {games.map((game) => (
                <Link
                  className="grid gap-3 border-b py-5 transition-colors hover:bg-muted/50 sm:grid-cols-[minmax(0,1fr)_auto]"
                  href={`/games/${game.id}`}
                  key={game.id}
                >
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-foreground">{game.name}</h2>
                    {game.description ? (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {game.description}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {game.targetAudience ? <Badge variant="secondary">{game.targetAudience}</Badge> : null}
                      {game.subject ? <Badge variant="secondary">{game.subject}</Badge> : null}
                    </div>
                  </div>
                  <Badge variant="outline" className="h-fit capitalize">
                    {game.lifecycleStatus}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PlatformShell>
  );
}
