import { signIn, signOut } from '@/auth';
import { Github, LogIn, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

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
      <Button type="submit">
        {icon}
        {label}
      </Button>
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
    <div className="flex flex-wrap gap-2">
      {hasGithub ? (
        <ProviderSignInAction provider="github" label="Sign in with GitHub" icon={<Github size={16} />} />
      ) : null}
      {hasGoogle ? (
        <ProviderSignInAction provider="google" label="Sign in with Google" icon={<span aria-hidden>G</span>} />
      ) : null}
      {hasOidc ? (
        <ProviderSignInAction provider="oidc" label="Sign in with OIDC" icon={<LogIn size={16} />} />
      ) : null}
      {!hasGithub && !hasGoogle && !hasOidc ? (
        <p className="text-sm font-semibold text-destructive">No SSO provider is configured.</p>
      ) : null}
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
      <Button variant="outline" type="submit">
        <LogOut size={16} />
        Sign out
      </Button>
    </form>
  );
}
