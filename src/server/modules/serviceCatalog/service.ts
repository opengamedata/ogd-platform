import { prisma } from '@/server/db/prisma';

export async function listServiceDefinitions() {
  return prisma.serviceDefinition.findMany({
    where: { status: 'active' },
    orderBy: { displayName: 'asc' },
  });
}

export async function getServiceDefinitionByKey(serviceKey: string) {
  return prisma.serviceDefinition.findUnique({ where: { serviceKey } });
}

export function renderLaunchUrl(
  template: string | null,
  input: { enrollmentId: string; gameId: string },
) {
  if (!template) {
    return null;
  }

  return template
    .replaceAll('{enrollmentId}', encodeURIComponent(input.enrollmentId))
    .replaceAll('{gameId}', encodeURIComponent(input.gameId));
}
