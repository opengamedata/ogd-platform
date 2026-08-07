import { renderLaunchUrl } from '@/server/modules/serviceCatalog/service';

describe('service catalog', () => {
  it('renders Pipeline handoff URLs from opaque stable ids', () => {
    expect(
      renderLaunchUrl('/pipeline/setup?enrollment={enrollmentId}&game={gameId}', {
        enrollmentId: 'enrollment_123',
        gameId: 'game_456',
      }),
    ).toBe('/pipeline/setup?enrollment=enrollment_123&game=game_456');
  });

  it('allows setup to remain a Platform placeholder', () => {
    expect(renderLaunchUrl(null, { enrollmentId: 'a', gameId: 'b' })).toBeNull();
  });
});
