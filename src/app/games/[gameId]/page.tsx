import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SignOutAction } from '@/components/AuthActions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { requireCurrentUser } from '@/server/modules/auth/session';
import { getGameForUser } from '@/server/modules/games/service';

type PageProps = { params: Promise<{ gameId: string }> };

export default async function GameOverviewPage({ params }: PageProps) {
  const user = await requireCurrentUser();
  const { gameId } = await params;
  const game = await getGameForUser(gameId, user.id);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex flex-col items-start gap-4 border-b bg-background px-7 py-4 sm:min-h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link className="flex items-center gap-3 font-bold tracking-normal" href="/">
          <img
            src="/ogd/OGD-logotype-96.png"
            alt="Open Game Data"
            width={733}
            height={89}
            className="h-5 w-auto sm:h-6"
          />
          <Badge variant="outline" className="hidden sm:inline-flex">
            Platform
          </Badge>
        </Link>
        <SignOutAction />
      </header>

      <main className="grid min-h-[calc(100svh-4rem)] grid-rows-[auto_minmax(320px,1fr)] px-7 py-8">
        <Button asChild variant="outline" className="w-fit">
          <Link href="/">
            <ArrowLeft size={16} />
            Back
          </Link>
        </Button>
        <section className="py-8">
          <p className="font-mono text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Game
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl font-extrabold leading-none tracking-normal text-foreground md:text-6xl">
            {game.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This route is authenticated and ready for the next overview design.
          </p>
        </section>
        <Separator />
        <section
          className="border-b bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45"
          aria-label="Game overview canvas"
        />
      </main>
    </div>
  );
}
