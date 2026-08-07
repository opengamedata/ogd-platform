import { appendShortId, slugify } from '@/lib/slug';

describe('slug helpers', () => {
  it('creates stable lowercase URL segments', () => {
    expect(slugify('  AQUALAB: Research Build!  ')).toBe('aqualab-research-build');
  });

  it('does not use blank slugs', () => {
    expect(slugify('***')).toBe('untitled');
  });

  it('appends an opaque suffix instead of relying on display name identity', () => {
    expect(appendShortId('aqualab', '12345678-aaaa-bbbb-cccc-999999999999')).toBe(
      'aqualab-12345678',
    );
  });
});
