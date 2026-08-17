import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PlatformShell } from '@/components/PlatformShell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { getGameForUser } from '@/server/modules/games/service';
import { updateGameAction } from '@/app/games/actions';
import { GameForm } from '@/app/games/GameForm';

type PageProps = {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function GameOverviewPage({ params, searchParams }: PageProps) {
  const user = await requireCurrentUser();
  const { gameId } = await params;
  const { mode } = await searchParams;
  const game = await getGameForUser(gameId, user.id);
  const isEditing = mode === 'edit';

  return (
    <PlatformShell activeItem="games" userEmail={user.primaryEmail}>
      <div className="min-h-svh px-7 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" className="w-fit">
            <Link href="/games">
              <ArrowLeft size={16} />
              Back
            </Link>
          </Button>
          {!isEditing ? (
            <Button asChild variant="outline">
              <Link href={`/games/${game.id}?mode=edit`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
          ) : null}
        </div>
        <section className="py-8">
          <p className="font-mono text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Game
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl font-extrabold leading-none tracking-normal text-foreground md:text-6xl">
            {game.name}
          </h1>
          {game.description ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {game.description}
            </p>
          ) : null}
        </section>
        <Separator />

        {isEditing ? (
          <section className="py-8">
            <h2 className="text-2xl font-bold tracking-normal text-foreground">Edit game details</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Update the public game metadata shown in the Platform.
            </p>
            <div className="mt-7">
              <GameForm
                action={updateGameAction}
                cancelHref={`/games/${game.id}`}
                defaultValues={{
                  name: game.name,
                  description: game.description,
                  targetAudience: game.targetAudience,
                  subject: game.subject,
                  thumbnailUrl: game.thumbnailUrl,
                  playUrl: game.playUrl,
                  sourceUrl: game.sourceUrl,
                  studies: game.studies,
                }}
                gameId={game.id}
                submitLabel="Save changes"
              />
            </div>
          </section>
        ) : (
          <section className="py-8">
            <dl className="grid">
              {game.targetAudience ? (
                <div className="grid gap-2 border-b py-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <dt className="text-sm font-semibold text-muted-foreground">Target audience</dt>
                  <dd className="text-base text-foreground">{game.targetAudience}</dd>
                </div>
              ) : null}
              {game.subject ? (
                <div className="grid gap-2 border-b py-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <dt className="text-sm font-semibold text-muted-foreground">Subject</dt>
                  <dd className="text-base text-foreground">{game.subject}</dd>
                </div>
              ) : null}
              {game.playUrl ? (
                <div className="grid gap-2 border-b py-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <dt className="text-sm font-semibold text-muted-foreground">Play link</dt>
                  <dd className="min-w-0">
                    <a className="break-all text-sm font-semibold text-accent hover:underline" href={game.playUrl}>
                      {game.playUrl}
                    </a>
                  </dd>
                </div>
              ) : null}
              {game.sourceUrl ? (
                <div className="grid gap-2 border-b py-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <dt className="text-sm font-semibold text-muted-foreground">Source link</dt>
                  <dd className="min-w-0">
                    <a className="break-all text-sm font-semibold text-accent hover:underline" href={game.sourceUrl}>
                      {game.sourceUrl}
                    </a>
                  </dd>
                </div>
              ) : null}
              {game.thumbnailUrl ? (
                <div className="grid gap-2 border-b py-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <dt className="text-sm font-semibold text-muted-foreground">Thumbnail image</dt>
                  <dd className="min-w-0">
                    <a className="break-all text-sm font-semibold text-accent hover:underline" href={game.thumbnailUrl}>
                      {game.thumbnailUrl}
                    </a>
                  </dd>
                </div>
              ) : null}
              {game.studies ? (
                <div className="grid gap-2 border-b py-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <dt className="text-sm font-semibold text-muted-foreground">Studies</dt>
                  <dd className="whitespace-pre-wrap text-base leading-7 text-foreground">{game.studies}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        )}
      </div>
    </PlatformShell>
  );
}
