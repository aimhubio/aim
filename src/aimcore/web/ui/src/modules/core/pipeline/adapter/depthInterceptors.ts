import { AimObjectDepths } from 'types/core/enums';
import { SequenceFullView } from 'types/core/AimObjects';
import { Record } from 'types/core/shared';

import { DepthInterceptors } from './types';

const depthInterceptors: DepthInterceptors = {
  [AimObjectDepths.Container]: (container) => {
    return {
      data: {
        traces: container.traces,
      },
    };
  },
  [AimObjectDepths.Sequence]: (sequence: SequenceFullView) => {
    return {
      data: sequence,
    };
  },
  [AimObjectDepths.Step]: (sequence: SequenceFullView) => {
    return {
      data: sequence,
    };
  },
  [AimObjectDepths.Index]: (record: Record) => {
    return {
      data: record,
    };
  },
};

export default depthInterceptors;
