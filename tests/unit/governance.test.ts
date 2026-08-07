import { validateGovernanceTransition } from '@/server/modules/governance/transitions';

describe('Game governance transitions', () => {
  const current = {
    lifecycleStatus: 'draft',
    privacyClassification: 'private',
    releaseStatus: 'not_submitted',
  };

  it('rejects changes to archived Games', () => {
    expect(() =>
      validateGovernanceTransition(
        { ...current, lifecycleStatus: 'archived' },
        { releaseStatus: 'approved' },
      ),
    ).toThrow('Archived Games cannot be changed.');
  });

  it('rejects public approval for test privacy classification', () => {
    expect(() =>
      validateGovernanceTransition(current, {
        releaseStatus: 'approved',
        privacyClassification: 'test',
      }),
    ).toThrow('test privacy classification');
  });

  it('requires approved release before active lifecycle', () => {
    expect(() =>
      validateGovernanceTransition(current, {
        lifecycleStatus: 'active',
      }),
    ).toThrow('must be approved');
  });

  it('allows active lifecycle when release is approved', () => {
    expect(() =>
      validateGovernanceTransition(current, {
        lifecycleStatus: 'active',
        releaseStatus: 'approved',
      }),
    ).not.toThrow();
  });
});
