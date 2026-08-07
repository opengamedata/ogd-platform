import { ForbiddenError } from '../errors';
import type { GameLifecycleStatus, PrivacyClassification, ReleaseStatus } from '../sharedTypes';

type GovernanceState = {
  lifecycleStatus: string;
  privacyClassification: string;
  releaseStatus: string;
};

type GovernancePatch = {
  lifecycleStatus?: GameLifecycleStatus;
  privacyClassification?: PrivacyClassification;
  releaseStatus?: ReleaseStatus;
};

export function validateGovernanceTransition(current: GovernanceState, patch: GovernancePatch) {
  if (current.lifecycleStatus === 'archived') {
    throw new ForbiddenError('Archived Games cannot be changed.');
  }

  if (patch.releaseStatus === 'approved' && patch.privacyClassification === 'test') {
    throw new ForbiddenError('A test privacy classification cannot be approved for release.');
  }

  if (
    patch.lifecycleStatus === 'active' &&
    (patch.releaseStatus ?? current.releaseStatus) !== 'approved'
  ) {
    throw new ForbiddenError('A Game must be approved before it becomes active.');
  }
}
