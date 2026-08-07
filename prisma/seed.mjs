import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.serviceDefinition.upsert({
    where: { serviceKey: 'pipeline' },
    update: {
      displayName: 'OGD Pipeline',
      description:
        'Telemetry ingestion, transformation, and dataset publication setup owned by the Pipeline service.',
      launchUrlTemplate: process.env.PIPELINE_LAUNCH_URL_TEMPLATE || null,
      status: 'active',
    },
    create: {
      serviceKey: 'pipeline',
      displayName: 'OGD Pipeline',
      description:
        'Telemetry ingestion, transformation, and dataset publication setup owned by the Pipeline service.',
      launchUrlTemplate: process.env.PIPELINE_LAUNCH_URL_TEMPLATE || null,
      status: 'active',
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
