/**
 * @jest-environment node
 */

jest.mock('@/server/modules/auth/session', () => ({
  requireCurrentUser: jest.fn().mockResolvedValue({ id: 'user-1' }),
}));

jest.mock('@/server/modules/organizations/service', () => ({
  createOrganization: jest.fn().mockResolvedValue({
    id: 'org-1',
    name: 'Field Day',
    slug: 'field-day-12345678',
  }),
  listOrganizationsForUser: jest.fn().mockResolvedValue([]),
}));

import { POST } from '@/app/api/organizations/route';
import { createOrganization } from '@/server/modules/organizations/service';

describe('POST /api/organizations', () => {
  it('creates an organization for the current user', async () => {
    const response = await POST(
      new Request('http://localhost/api/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: 'Field Day' }),
      }),
    );

    expect(response.status).toBe(201);
    expect(createOrganization).toHaveBeenCalledWith({
      name: 'Field Day',
      actorUserId: 'user-1',
    });
    await expect(response.json()).resolves.toEqual({
      data: {
        organization: {
          id: 'org-1',
          name: 'Field Day',
          slug: 'field-day-12345678',
        },
      },
    });
  });
});
