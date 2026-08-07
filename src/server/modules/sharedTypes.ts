export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';
export type MembershipStatus = 'active' | 'invited' | 'suspended';

export type GameLifecycleStatus = 'draft' | 'testing' | 'active' | 'archived';
export type PrivacyClassification =
  | 'test'
  | 'private'
  | 'embargoed'
  | 'approved_public'
  | 'restricted_human_subjects';
export type ReleaseStatus =
  | 'not_submitted'
  | 'pending_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected';

export type EnrollmentStatus =
  | 'requested'
  | 'setup_required'
  | 'active'
  | 'suspended'
  | 'archived';

export type ReviewStatus =
  | 'not_required'
  | 'draft'
  | 'pending'
  | 'changes_requested'
  | 'approved'
  | 'rejected';

export type PlatformAction =
  | 'organization.created'
  | 'organization.updated'
  | 'game.created'
  | 'game.updated'
  | 'game.archived'
  | 'game.governance_changed'
  | 'service_enrollment.created'
  | 'service_enrollment.updated'
  | 'review.created';
