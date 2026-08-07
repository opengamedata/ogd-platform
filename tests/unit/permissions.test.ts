import {
  canChangeGovernance,
  canCreateGame,
  canEnrollService,
  canRead,
  canUpdateGameMetadata,
  compareRoles,
} from '@/server/modules/auth/permissions';

describe('authorization policy', () => {
  it('allows all active organization roles to read', () => {
    expect(['owner', 'admin', 'member', 'viewer'].every((role) => canRead(role))).toBe(true);
  });

  it('limits creation, governance, and enrollment to owner/admin', () => {
    expect(canCreateGame('owner')).toBe(true);
    expect(canCreateGame('admin')).toBe(true);
    expect(canCreateGame('member')).toBe(false);
    expect(canChangeGovernance('viewer')).toBe(false);
    expect(canEnrollService('member')).toBe(false);
  });

  it('allows member metadata updates without governance changes', () => {
    expect(canUpdateGameMetadata('member')).toBe(true);
    expect(canUpdateGameMetadata('viewer')).toBe(false);
  });

  it('orders roles by privilege', () => {
    expect(compareRoles('owner', 'viewer')).toBeGreaterThan(0);
    expect(compareRoles('member', 'admin')).toBeLessThan(0);
  });
});
