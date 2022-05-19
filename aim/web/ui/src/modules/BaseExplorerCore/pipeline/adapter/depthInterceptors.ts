import { AimObjectDepths } from 'types/core/enums';
import { RunSearchRunView, SequenceFullView } from 'types/core/AimObjects';

interface Container extends RunSearchRunView {}

export type ProcessInterceptor = (...arg: any) => any;

type Record = {
  index: number;
};
type DepthInterceptors = {
  [key in AimObjectDepths]: ProcessInterceptor;
};

const depthInterceptors: DepthInterceptors = {
  [AimObjectDepths.Container]: (container: Container) => {
    return {
      data: {
        traces: (container as Container).traces,
      },
    };
  },
  [AimObjectDepths.Sequence]: (sequence: SequenceFullView) => {
    return {
      data: sequence as SequenceFullView,
    };
  },
  [AimObjectDepths.Step]: (sequenceBase: SequenceFullView) => {
    return {
      data: sequenceBase,
    };
  },
  [AimObjectDepths.Index]: (record: Record) => {
    return {
      data: record,
    };
  },
};

export default depthInterceptors;
