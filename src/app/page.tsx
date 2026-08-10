import { auth } from '@/auth';
import { SignInAction, SignOutAction } from '@/components/AuthActions';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/server/modules/auth/session';

export default async function HomePage() {
  const session = await auth();
  const user = session ? await getCurrentUser() : null;

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex flex-col items-start gap-4 border-b bg-background px-7 py-4 sm:min-h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <div className="flex items-center gap-3 font-bold tracking-normal">
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
        </div>
        {session ? <SignOutAction /> : <SignInAction />}
      </header>

      {session && user ? (
        <main className="grid min-h-[calc(100svh-4rem)] grid-rows-[auto_minmax(320px,1fr)] px-7 py-8">
          <section className="pb-8">
            <p className="font-mono text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Signed in
            </p>
            <h1 className="mt-3 max-w-3xl text-5xl font-extrabold leading-none tracking-normal text-foreground md:text-6xl">
              OGD Platform
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{user.primaryEmail}</p>
          </section>
          <Separator />
          <section
            className="mt-0 border-b bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45"
            aria-label="Workspace canvas"
          />
        </main>
      ) : (
        <main className="grid min-h-[calc(100svh-4rem)] content-center gap-6 px-7 py-8">
          <p className="font-mono text-xs font-medium uppercase tracking-normal text-muted-foreground">
            Platform Control Plane
          </p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-none tracking-normal text-foreground md:text-6xl">
            Sign in to continue.
          </h1>
          <SignInAction />
        </main>
      )}
    </div>
  );
}
