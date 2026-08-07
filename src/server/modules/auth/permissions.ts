import { ForbiddenError } from '../errors';
import type { OrganizationRole } from '../sharedTypes';

const roleRank: Record<OrganizationRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function canRead(role?: string | null) {
  return role === 'owner' || role === 'admin' || role === 'member' || role === 'viewer';
}

export function canManageOrganization(role?: string | null) {
  return role === 'owner' || role === 'admin';
}

export function canCreateGame(role?: string | null) {
  return role === 'owner' || role === 'admin';
}

export function canUpdateGameMetadata(role?: string | null) {
  return role === 'owner' || role === 'admin' || role === 'member';
}

export function canChangeGovernance(role?: string | null) {
  return role === 'owner' || role === 'admin';
}

export function canEnrollService(role?: string | null) {
  return role === 'owner' || role === 'admin';
}

export function requireRole(
  role: string | null | undefined,
  predicate: (role?: string | null) => boolean,
  message = 'You do not have access to perform this action.',
) {
  if (!predicate(role)) {
    throw new ForbiddenError(message);
  }
}

export function compareRoles(left: OrganizationRole, right: OrganizationRole) {
  return roleRank[left] - roleRank[right];
}
