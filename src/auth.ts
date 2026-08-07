import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { Provider } from 'next-auth/providers';
import { upsertUserFromExternalIdentity } from './server/modules/identity/service';

function hasCredential(value: string | undefined) {
  return Boolean(value && value !== 'replace-me');
}

const oidcProvider = (): Provider | null => {
  if (
    !hasCredential(process.env.OIDC_ISSUER) ||
    !hasCredential(process.env.OIDC_CLIENT_ID) ||
    !hasCredential(process.env.OIDC_CLIENT_SECRET)
  ) {
    return null;
  }

  return {
  id: 'oidc',
  name: 'OIDC',
  type: 'oidc',
  issuer: process.env.OIDC_ISSUER,
  clientId: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  authorization: {
    params: {
      scope: 'openid email profile',
    },
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name ?? profile.preferred_username ?? null,
      email: profile.email,
      image: profile.picture ?? null,
    };
  },
};
};

const providers = [
  hasCredential(process.env.GITHUB_CLIENT_ID) && hasCredential(process.env.GITHUB_CLIENT_SECRET)
    ? GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    : null,
  hasCredential(process.env.GOOGLE_CLIENT_ID) && hasCredential(process.env.GOOGLE_CLIENT_SECRET)
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null,
  oidcProvider(),
].filter((provider): provider is Provider => provider !== null);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers,
  callbacks: {
    async signIn({ profile, user }) {
      return Boolean(user.email ?? profile?.email);
    },
    async jwt({ token, account, profile }) {
      const email =
        token.email ??
        (typeof profile?.email === 'string' ? profile.email : null);

      if (account && account.providerAccountId && email) {
        const user = await upsertUserFromExternalIdentity({
          provider: account.provider,
          providerSubject: account.providerAccountId,
          email,
          displayName: token.name,
        });
        token.platformUserId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.platformUserId === 'string') {
        session.user.id = token.platformUserId;
      }
      return session;
    },
  },
});
