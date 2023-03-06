import React from 'react';

import { IBoxContentProps } from 'modules/BaseExplorer/types';
import { IAxesPropsConfig } from 'modules/BaseExplorer/components/Controls/ConfigureAxes';

import { filterMetricsData } from 'utils/app/filterMetricData';
import { AlignmentOptionsEnum } from 'utils/d3';
import sortDependingArrays from 'utils/app/sortDependingArrays';

interface FilteredMetricData {
  timestamps: Float64Array;
  values: Float64Array;
  steps: Float64Array;
  epochs: Float64Array;
  x_axis_iters: Float64Array;
  x_axis_values: Float64Array;
}

function useAlignMetricsData(
  engine: IBoxContentProps['engine'],
  vizEngine: any,
  data: any[] = [],
): [typeof data, IAxesPropsConfig] {
  const config: IAxesPropsConfig = engine.useStore(
    vizEngine.controls.axesProperties.stateSelector,
  );

  const alignedData = React.useMemo(() => {
    const items = [];
    for (let item of data) {
      const filteredItem: FilteredMetricData = filterMetricsData(
        item.data,
        config.alignment.type,
        config.axesScaleType,
      );
      const alignedData = alignData(filteredItem, config.alignment.type);

      items.push({ ...item, data: alignedData });
    }
    return items;
  }, [data, config]);

  return [alignedData, config];
}

export default useAlignMetricsData;

export function alignByStep(data: FilteredMetricData) {
  const { sortedXValues, sortedArrays } = sortDependingArrays([...data.steps], {
    yValues: [...data.values],
  });
  return {
    xValues: sortedXValues,
    yValues: sortedArrays.yValues,
  };
}

export function alignByEpoch(data: FilteredMetricData) {
  const epochs: Record<string, number[]> = {};

  data.epochs.forEach((epoch, i) => {
    if (epochs.hasOwnProperty(epoch)) {
      epochs[epoch].push(data.steps[i]);
    } else {
      epochs[epoch] = [data.steps[i]];
    }
  });

  const xValues = [
    ...data.epochs.map((epoch, i) => {
      return (
        epoch +
        (epochs[epoch].length > 1
          ? (0.99 / epochs[epoch].length) * epochs[epoch].indexOf(data.steps[i])
          : 0)
      );
    }),
  ];

  const { sortedXValues, sortedArrays } = sortDependingArrays([...xValues], {
    yValues: [...data.values],
  });
  return {
    xValues: sortedXValues,
    yValues: sortedArrays.yValues,
  };
}

export function alignByRelativeTime(data: FilteredMetricData) {
  const firstDate = data.timestamps[0];
  const timestamps: Record<string, number[]> = {};
  data.timestamps.forEach((timestamp, i) => {
    if (timestamps.hasOwnProperty(timestamp)) {
      timestamps[timestamp].push(data.steps[i]);
    } else {
      timestamps[timestamp] = [data.steps[i]];
    }
  });

  const xValues = [
    ...data.timestamps.map(
      (timestamp, i) =>
        timestamp -
        firstDate +
        (timestamps[timestamp].length > 1
          ? (0.99 / timestamps[timestamp].length) *
            timestamps[timestamp].indexOf(data.steps[i])
          : 0),
    ),
  ];

  const { sortedXValues, sortedArrays } = sortDependingArrays([...xValues], {
    yValues: [...data.values],
  });
  return {
    xValues: sortedXValues,
    yValues: sortedArrays.yValues,
  };
}

export function alignByAbsoluteTime(data: FilteredMetricData) {
  const { sortedXValues, sortedArrays } = sortDependingArrays(
    [...data.timestamps],
    {
      yValues: [...data.values],
    },
  );
  return {
    xValues: sortedXValues,
    yValues: sortedArrays.yValues,
  };
}

export function alignByCustomMetric(data: FilteredMetricData) {
  const { sortedXValues, sortedArrays } = sortDependingArrays(
    [...data.x_axis_values],
    { yValues: [...data.values] },
  );

  return {
    xValues: sortedXValues,
    yValues: sortedArrays.yValues,
  };
}

export function alignData(
  data: FilteredMetricData,
  type: AlignmentOptionsEnum = AlignmentOptionsEnum.STEP,
) {
  const alignmentObj: Record<string, Function> = {
    [AlignmentOptionsEnum.STEP]: alignByStep,
    [AlignmentOptionsEnum.EPOCH]: alignByEpoch,
    [AlignmentOptionsEnum.RELATIVE_TIME]: alignByRelativeTime,
    [AlignmentOptionsEnum.ABSOLUTE_TIME]: alignByAbsoluteTime,
    [AlignmentOptionsEnum.CUSTOM_METRIC]: alignByCustomMetric,
    default: () => {
      throw new Error('Unknown value for X axis alignment');
    },
  };
  const alignment = alignmentObj[type] || alignmentObj.default;
  return alignment(data);
}
