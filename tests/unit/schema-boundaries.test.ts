import fs from 'node:fs';
import path from 'node:path';

describe('Platform schema boundaries', () => {
  const schema = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8');
  const migration = fs.readFileSync(
    path.join(process.cwd(), 'prisma/migrations/0001_initial/migration.sql'),
    'utf8',
  );

  it('does not model deferred Platform or Pipeline-owned entities', () => {
    const disallowedModelNames = [
      'model Project',
      'model Study',
      'model PipelineIntegration',
      'model IntegrationEnvironment',
      'model LoggingSpec',
      'model Dataset',
      'model Generator',
    ];

    for (const name of disallowedModelNames) {
      expect(schema).not.toContain(name);
    }
  });

  it('keeps Pipeline participation generic and unique per Game/service', () => {
    expect(schema).toContain('model ServiceDefinition');
    expect(schema).toContain('model ServiceEnrollment');
    expect(schema).toContain('@@unique([gameId, serviceDefinitionId])');
  });

  it('seeds Pipeline idempotently', () => {
    expect(migration).toContain("service_key, display_name");
    expect(migration).toContain("'pipeline'");
    expect(migration).toContain('ON CONFLICT (service_key) DO NOTHING');
  });
});
