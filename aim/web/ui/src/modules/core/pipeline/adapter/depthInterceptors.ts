import { AimObjectDepths } from 'types/core/enums';
import { SequenceFullView, Container } from 'types/core/AimObjects';
import { Record } from 'types/core/shared';

import { filterMetricsData } from 'utils/app/filterMetricData';

import { DepthInterceptors } from './types';

const depthInterceptors: DepthInterceptors = {
  [AimObjectDepths.Container]: (container: Container) => {
    return {
      data: {
        traces: (container as Container).traces,
      },
    };
  },
  [AimObjectDepths.Sequence]: (sequence: SequenceFullView) => {
    const filteredData = filterMetricsData(sequence);

    return {
      data: {
        xValues: [...filteredData.steps],
        yValues: [...filteredData.values],
      },
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
