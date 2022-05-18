import { AimObjectDepths } from 'types/core/enums';
import { RunSearchRunView, SequenceFullView } from 'types/core/AimObjects';

interface Container extends RunSearchRunView {}

type ProcessInterceptor = (...arg: any) => any;

type Record = {
  index: number;
};
type DepthInterceptors = {
  [key in AimObjectDepths]: ProcessInterceptor;
};

export const depthInterceptors: DepthInterceptors = {
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
  [AimObjectDepths.Index]: (
    sequence: SequenceFullView,
    record: Record,
    index: number,
  ) => {
    return {
      data: {
        ...record,
        step: sequence.iters[index],
        index: record.index,
        epoch: sequence.epochs[index],
      },
    };
  },
};
