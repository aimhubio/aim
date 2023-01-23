import React from 'react';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

import { IAxesPropsConfig } from 'pages/MetricsExplorer/Controls/ConfigureAxes';

import { filterMetricsData } from 'utils/app/filterMetricData';
import { AlignmentOptionsEnum } from 'utils/d3';

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
  visualizationName: string,
  data: any[] = [],
) {
  const vizEngine = engine.visualizations[visualizationName];
  const axesPropsConfig: IAxesPropsConfig = engine.useStore(
    vizEngine.controls.axesProperties.stateSelector,
  );

  const alignedData = React.useMemo(() => {
    const items = [];
    for (let item of data) {
      const filteredItem: FilteredMetricData = filterMetricsData(
        item.data,
        axesPropsConfig.alignment.type,
        axesPropsConfig.axesScale.type,
      );
      const alignedData = alignData(
        filteredItem,
        axesPropsConfig.alignment.type,
      );

      items.push({
        ...item,
        data: alignedData,
      });
    }

    return items;
  }, [data, axesPropsConfig]);

  return { alignedData, axesPropsConfig };
}

export default useAlignMetricsData;

export function alignByStep(data: FilteredMetricData) {
  return {
    xValues: [...data.steps],
    yValues: [...data.values],
  };
}

export function alignByEpoch(data: FilteredMetricData) {
  const epochs: { [key: number]: number[] } = {};

  data.epochs.forEach((epoch, i) => {
    if (epochs.hasOwnProperty(epoch)) {
      epochs[epoch].push(data.steps[i]);
    } else {
      epochs[epoch] = [data.steps[i]];
    }
  });

  return {
    xValues: [
      ...data.epochs.map((epoch, i) => {
        return (
          epoch +
          (epochs[epoch].length > 1
            ? (0.99 / epochs[epoch].length) *
              epochs[epoch].indexOf(data.steps[i])
            : 0)
        );
      }),
    ],
    yValues: [...data.values],
  };
}

export function alignByRelativeTime(data: FilteredMetricData) {
  const firstDate = data.timestamps[0];
  const timestamps: { [key: number]: number[] } = {};
  data.timestamps.forEach((timestamp, i) => {
    if (timestamps.hasOwnProperty(timestamp)) {
      timestamps[timestamp].push(data.steps[i]);
    } else {
      timestamps[timestamp] = [data.steps[i]];
    }
  });

  return {
    xValues: [
      ...data.timestamps.map(
        (timestamp, i) =>
          timestamp -
          firstDate +
          (timestamps[timestamp].length > 1
            ? (0.99 / timestamps[timestamp].length) *
              timestamps[timestamp].indexOf(data.steps[i])
            : 0),
      ),
    ],
    yValues: [...data.values],
  };
}

export function alignByAbsoluteTime(data: FilteredMetricData) {
  return {
    xValues: [...data.timestamps],
    yValues: [...data.values],
  };
}

export function alignByCustomMetric(data: FilteredMetricData) {
  // let missingTraces = false;
  // for (let i = 0; i < data.length; i++) {
  //   const metricCollection = data[i];
  //   for (let j = 0; j < metricCollection.data.length; j++) {
  //     const metric = metricCollection.data[j];
  //     const missingIndexes: number[] = [];
  //     if (metric.x_axis_iters && metric.x_axis_values) {
  //       const { x_axis_iters: xAxisIters, x_axis_values: xAxisValues } = metric;
  //       if (xAxisValues.length === metric.data.values.length) {
  //         const { sortedXValues, sortedArrays } = sortDependingArrays(
  //           [...xAxisValues],
  //           {
  //             yValues: [...metric.data.values],
  //             epochs: [...metric.data.epochs],
  //             steps: [...metric.data.steps],
  //             timestamps: [...metric.data.timestamps],
  //             values: [...metric.data.values],
  //           },
  //         );
  //
  //         metric.data = {
  //           ...metric.data,
  //           ...sortedArrays,
  //           xValues: sortedXValues,
  //         };
  //       } else {
  //         metric.data.steps.forEach((step, index) => {
  //           if (xAxisIters.indexOf(step) === -1) {
  //             missingIndexes.push(index);
  //           }
  //         });
  //         const epochs = filterArrayByIndexes(
  //           missingIndexes,
  //           metric.data.epochs,
  //         );
  //         const steps = filterArrayByIndexes(missingIndexes, metric.data.steps);
  //         const timestamps = filterArrayByIndexes(
  //           missingIndexes,
  //           metric.data.timestamps,
  //         );
  //         const values = filterArrayByIndexes(
  //           missingIndexes,
  //           metric.data.values,
  //         );
  //         const yValues = filterArrayByIndexes(
  //           missingIndexes,
  //           metric.data.yValues,
  //         );
  //
  //         const { sortedXValues, sortedArrays } = sortDependingArrays(
  //           [...xAxisValues],
  //           {
  //             yValues: [...yValues],
  //             epochs: [...epochs],
  //             steps: [...steps],
  //             timestamps: [...timestamps],
  //             values: [...values],
  //           },
  //         );
  //
  //         metric.data = {
  //           ...metric.data,
  //           ...sortedArrays,
  //           xValues: sortedXValues,
  //         };
  //       }
  //     } else {
  //       missingTraces = true;
  //     }
  //   }
  // }
  // if (missingTraces && model) {
  //   onNotificationAdd({
  //     notification: {
  //       id: Date.now(),
  //       severity: 'error',
  //       messages: [AlignmentNotificationsEnum.NOT_ALL_ALIGNED],
  //     },
  //     model,
  //   });
  // }
  // return data;

  return {
    xValues: [...data.steps],
    yValues: [...data.values],
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
