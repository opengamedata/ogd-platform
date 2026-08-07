import { prisma } from '@/server/db/prisma';

export type AuthIdentityInput = {
  provider: string;
  providerSubject: string;
  email: string;
  displayName?: string | null;
};

export async function upsertUserFromExternalIdentity(input: AuthIdentityInput) {
  const existingIdentity = await prisma.externalIdentity.findUnique({
    where: {
      provider_providerSubject: {
        provider: input.provider,
        providerSubject: input.providerSubject,
      },
    },
    include: { user: true },
  });

  if (existingIdentity) {
    return prisma.user.update({
      where: { id: existingIdentity.userId },
      data: {
        primaryEmail: input.email,
        displayName: input.displayName ?? existingIdentity.user.displayName,
      },
    });
  }

  return prisma.user.upsert({
    where: { primaryEmail: input.email },
    update: {
      displayName: input.displayName ?? undefined,
      externalIdentities: {
        create: {
          provider: input.provider,
          providerSubject: input.providerSubject,
        },
      },
    },
    create: {
      primaryEmail: input.email,
      displayName: input.displayName,
      externalIdentities: {
        create: {
          provider: input.provider,
          providerSubject: input.providerSubject,
        },
      },
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
