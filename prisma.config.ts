import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed.mjs',
  },
});
