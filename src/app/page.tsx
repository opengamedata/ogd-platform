import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { SignInAction } from '@/components/AuthActions';
import { getCurrentUser } from '@/server/modules/auth/session';

export default async function HomePage() {
  const session = await auth();
  const user = session ? await getCurrentUser() : null;

  if (session && user) {
    redirect('/games');
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className="grid min-h-svh content-center gap-6 px-7 py-8">
        <img
          src="/ogd/OGD-logotype-96.png"
          alt="Open Game Data"
          width={733}
          height={89}
          className="h-8 w-auto"
        />
        <p className="font-mono text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Platform Control Plane
        </p>
        <h1 className="max-w-3xl text-5xl font-extrabold leading-none tracking-normal text-foreground md:text-6xl">
          Sign in to continue.
        </h1>
        <SignInAction />
      </main>
    </div>
  );
}
