import { AlignmentNotificationsEnum } from 'config/notification-messages/notificationMessages';

import { IMetricsCollection } from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IModel } from 'types/services/models/model';
import { IAppModelState } from 'types/services/models/explorer/createAppModel';

import { filterArrayByIndexes } from '../filterArrayByIndexes';

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

      metric.data = {
        ...metric.data,
        xValues: [
          ...metric.data.epochs.map((epoch, i) => {
            return (
              epoch +
              (epochs[epoch].length > 1
                ? (0.99 / epochs[epoch].length) *
                  epochs[epoch].indexOf(metric.data.steps[i])
                : 0)
            );
          }),
        ],
        yValues: [...metric.data.values],
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
  model: IModel<IAppModelState>,
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
  if (missingTraces) {
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
