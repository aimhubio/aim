import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';

import { IMetricsCollection } from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IModel } from 'types/services/models/model';
import { IAppModelState } from 'types/services/models/explorer/createAppModel';

import { filterArrayByIndexes } from '../filterArrayByIndexes';
import { AlignmentOptionsEnum } from '../d3';

import sortDependingArrays from './sortDependingArrays';
import onNotificationAdd from './onNotificationAdd';

export function alignByStep(
  data: IMetricsCollection<IMetric>[],
): IMetricsCollection<IMetric>[] {
  for (let i = 0; i < data.length; i++) {
    const metricCollection = data[i];
    for (let j = 0; j < metricCollection.data.length; j++) {
      const metric = metricCollection.data[j];
      metric.data = {
        ...metric.data,
        xValues: [...metric.data.steps],
        yValues: [...metric.data.values],
      };
    }
  }
  return data;
}

export function alignByEpoch(
  data: IMetricsCollection<IMetric>[],
): IMetricsCollection<IMetric>[] {
  for (let i = 0; i < data.length; i++) {
    const metricCollection = data[i];
    for (let j = 0; j < metricCollection.data.length; j++) {
      const metric = metricCollection.data[j];
      const epochs: { [key: number]: number[] } = {};

      metric.data.epochs.forEach((epoch, i) => {
        if (epochs.hasOwnProperty(epoch)) {
          epochs[epoch].push(metric.data.steps[i]);
        } else {
          epochs[epoch] = [metric.data.steps[i]];
        }
      });
      // Get unique epoch values (for ex. (1, 1.495) instead of (1, 1)), because the epochs can be duplicate
      let xValues = [
        ...metric.data.epochs.map((epoch, i) => {
          return (
            epoch +
            (epochs[epoch].length > 1
              ? (0.99 / epochs[epoch].length) *
                epochs[epoch].indexOf(metric.data.steps[i])
              : 0)
          );
        }),
      ];
      let yValues = [...metric.data.values];
      let pointsArray = [];
      // Combine the x and y axis arrays into an array of points
      for (let idx = 0; idx < xValues.length; idx++) {
        pointsArray[idx] = [xValues[idx], yValues[idx]];
      }
      // Sort the combined array based on the first element of the point (epoch)
      pointsArray.sort(function (a, b) {
        return a[0] - b[0];
      });
      metric.data = {
        ...metric.data,
        // Separate the x and y axis values back into xValues and yValues
        xValues: pointsArray.map((point) => point[0]),
        yValues: pointsArray.map((point) => point[1]),
      };
    }
  }
  return data;
}

export function alignByRelativeTime(
  data: IMetricsCollection<IMetric>[],
): IMetricsCollection<IMetric>[] {
  for (let i = 0; i < data.length; i++) {
    const metricCollection = data[i];
    for (let j = 0; j < metricCollection.data.length; j++) {
      const metric = metricCollection.data[j];
      const firstDate = metric.data.timestamps[0];
      const timestamps: { [key: number]: number[] } = {};
      metric.data.timestamps.forEach((timestamp, i) => {
        if (timestamps.hasOwnProperty(timestamp)) {
          timestamps[timestamp].push(metric.data.steps[i]);
        } else {
          timestamps[timestamp] = [metric.data.steps[i]];
        }
      });
      metric.data = {
        ...metric.data,
        xValues: [
          ...metric.data.timestamps.map(
            (timestamp, i) =>
              timestamp -
              firstDate +
              (timestamps[timestamp].length > 1
                ? (0.99 / timestamps[timestamp].length) *
                  timestamps[timestamp].indexOf(metric.data.steps[i])
                : 0),
          ),
        ],
        yValues: [...metric.data.values],
      };
    }
  }
  return data;
}

export function alignByAbsoluteTime(
  data: IMetricsCollection<IMetric>[],
): IMetricsCollection<IMetric>[] {
  for (let i = 0; i < data.length; i++) {
    const metricCollection = data[i];
    for (let j = 0; j < metricCollection.data.length; j++) {
      const metric = metricCollection.data[j];
      metric.data = {
        ...metric.data,
        xValues: [...metric.data.timestamps],
        yValues: [...metric.data.values],
      };
    }
  }
  return data;
}

export function alignByCustomMetric(
  data: IMetricsCollection<IMetric>[],
  model?: IModel<IAppModelState>,
): IMetricsCollection<IMetric>[] {
  let missingTraces = false;
  for (let i = 0; i < data.length; i++) {
    const metricCollection = data[i];
    for (let j = 0; j < metricCollection.data.length; j++) {
      const metric = metricCollection.data[j];
      const missingIndexes: number[] = [];
      if (metric.x_axis_iters && metric.x_axis_values) {
        const { x_axis_iters: xAxisIters, x_axis_values: xAxisValues } = metric;
        if (xAxisValues.length === metric.data.values.length) {
          const { sortedXValues, sortedArrays } = sortDependingArrays(
            [...xAxisValues],
            {
              yValues: [...metric.data.values],
              epochs: [...metric.data.epochs],
              steps: [...metric.data.steps],
              timestamps: [...metric.data.timestamps],
              values: [...metric.data.values],
            },
          );

          metric.data = {
            ...metric.data,
            ...sortedArrays,
            xValues: sortedXValues,
          };
        } else {
          metric.data.steps.forEach((step, index) => {
            if (xAxisIters.indexOf(step) === -1) {
              missingIndexes.push(index);
            }
          });
          const epochs = filterArrayByIndexes(
            missingIndexes,
            metric.data.epochs,
          );
          const steps = filterArrayByIndexes(missingIndexes, metric.data.steps);
          const timestamps = filterArrayByIndexes(
            missingIndexes,
            metric.data.timestamps,
          );
          const values = filterArrayByIndexes(
            missingIndexes,
            metric.data.values,
          );
          const yValues = filterArrayByIndexes(
            missingIndexes,
            metric.data.yValues,
          );

          const { sortedXValues, sortedArrays } = sortDependingArrays(
            [...xAxisValues],
            {
              yValues: [...yValues],
              epochs: [...epochs],
              steps: [...steps],
              timestamps: [...timestamps],
              values: [...values],
            },
          );

          metric.data = {
            ...metric.data,
            ...sortedArrays,
            xValues: sortedXValues,
          };
        }
      } else {
        missingTraces = true;
      }
    }
  }
  if (missingTraces && model) {
    onNotificationAdd({
      notification: {
        id: Date.now(),
        severity: 'error',
        messages: [AlignmentNotificationsEnum.NOT_ALL_ALIGNED],
      },
      model,
    });
  }
  return data;
}

export function alignData(
  data: IMetricsCollection<IMetric>[],
  type: AlignmentOptionsEnum = AlignmentOptionsEnum.STEP,
  model?: IModel<IAppModelState>,
): IMetricsCollection<IMetric>[] {
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
  return alignment(data, model);
}
