import { signIn, signOut } from '@/auth';
import { Github, LogIn, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

function hasCredential(value: string | undefined) {
  return Boolean(value && value !== 'replace-me');
}

function ProviderSignInAction({
  provider,
  label,
  icon,
}: {
  provider: 'github' | 'google' | 'oidc';
  label: string;
  icon: ReactNode;
}) {
  return (
    <form
      action={async () => {
        'use server';
        await signIn(provider);
      }}
    >
      <button type="submit">
        {icon}
        {label}
      </button>
    </form>
  );
}

export function SignInAction() {
  const hasGithub =
    hasCredential(process.env.GITHUB_CLIENT_ID) && hasCredential(process.env.GITHUB_CLIENT_SECRET);
  const hasGoogle =
    hasCredential(process.env.GOOGLE_CLIENT_ID) && hasCredential(process.env.GOOGLE_CLIENT_SECRET);
  const hasOidc =
    hasCredential(process.env.OIDC_ISSUER) &&
    hasCredential(process.env.OIDC_CLIENT_ID) &&
    hasCredential(process.env.OIDC_CLIENT_SECRET);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
      {hasGithub ? (
        <ProviderSignInAction provider="github" label="Sign in with GitHub" icon={<Github size={16} />} />
      ) : null}
      {hasGoogle ? (
        <ProviderSignInAction provider="google" label="Sign in with Google" icon={<span aria-hidden>G</span>} />
      ) : null}
      {hasOidc ? (
        <ProviderSignInAction provider="oidc" label="Sign in with OIDC" icon={<LogIn size={16} />} />
      ) : null}
      {!hasGithub && !hasGoogle && !hasOidc ? <p className="error">No SSO provider is configured.</p> : null}
    </div>
  );
}

export function SignOutAction() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <button className="secondary" type="submit">
        <LogOut size={16} />
        Sign out
      </button>
    </form>
  );
}
