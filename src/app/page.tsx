import { auth } from '@/auth';
import { PlatformWorkspace } from '@/components/PlatformWorkspace';
import { SignInAction, SignOutAction } from '@/components/AuthActions';
import { getCurrentUser } from '@/server/modules/auth/session';
import { listOrganizationsForUser } from '@/server/modules/organizations/service';

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export default async function HomePage() {
  const session = await auth();
  const user = session ? await getCurrentUser() : null;
  const organizations = user ? await listOrganizationsForUser(user.id) : [];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">OGD</span>
          <span>Platform</span>
        </div>
        {session ? <SignOutAction /> : <SignInAction />}
      </header>

      {session && user ? (
        <PlatformWorkspace initialOrganizations={serialize(organizations)} />
      ) : (
        <main className="main">
          <p className="eyebrow">Platform Control Plane</p>
          <h1>Sign in to manage Organizations, Games, governance, and service enrollment.</h1>
          <p className="lead">
            The first slice starts with Game as the Platform governance scope and uses generic service enrollment for Pipeline handoff.
          </p>
          <SignInAction />
        </main>
      )}
    </div>
  );
}
