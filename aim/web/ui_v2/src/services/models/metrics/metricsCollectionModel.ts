import * as _ from 'lodash-es';

import COLORS from 'config/colors/colors';
import metricsService from 'services/api/metrics/metricsService';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IRun } from 'types/services/models/metrics/runModel';
import createModel from '../model';
import createMetricModel from './metricModel';
import { createRunModel } from './runModel';
import { encode } from 'utils/encoder/encoder';
import {
  IMetricCollectionModelState,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsCollectionModel';
import { ILine } from 'types/components/LineChart/LineChart';
import getClosestValue from 'utils/getClosestValue';

const model = createModel<Partial<IMetricCollectionModelState>>({});

function getConfig() {
  return {
    grouping: {
      color: [],
      style: [],
      chart: [],
    },
  };
}

function initialize() {
  model.init();
  model.setState({
    config: getConfig(),
  });
}

function getMetricsData() {
  const { call, abort } = metricsService.getMetricsData();
  return {
    call: () =>
      call().then((data: IRun[]) => {
        model.setState({
          rawData: data,
          collection: processData(data),
        });
      }),
    abort,
  };
}

function processData(data: IRun[]): IMetric[][] {
  let metrics: IMetric[] = [];
  let index = -1;

  data.forEach((run: any) => {
    metrics = metrics.concat(
      run.metrics.map((metric: IMetric) => {
        index++;
        return createMetricModel({
          ...metric,
          run: createRunModel(_.omit(run, 'metrics') as IRun),
          key: encode({
            runHash: run.run_hash,
            metricName: metric.metric_name,
            traceContext: metric.context,
          }),
          data: {
            ...metric.data,
            xValues: [...metric.data.iterations],
            yValues: [...metric.data.values],
          },
          dasharray: '0',
          color: COLORS[index % COLORS.length],
        } as IMetric);
      }),
    );
  });
  return [metrics];
}

function getDataAsLines(): ILine[][] {
  const metricsCollection = model.getState()?.collection;
  if (!metricsCollection) {
    return [];
  }

  return metricsCollection.map((metrics: IMetric[]) =>
    metrics.map((metric: IMetric) => ({
      ...metric,
      data: {
        xValues: [...metric.data.iterations],
        yValues: [...metric.data.values],
      },
    })),
  );
}

function getDataAsTableRows(
  xValue: number | null = null,
): IMetricTableRowData[][] {
  const metricsCollection = model.getState()?.collection;
  if (!metricsCollection) {
    return [];
  }

  return metricsCollection.map((metrics: IMetric[]) =>
    metrics.map((metric: IMetric) => {
      const closestIndex =
        xValue === null
          ? null
          : getClosestValue(metric.data.iterations as any, xValue).index;
      return {
        key: metric.key,
        dasharray: metric.dasharray,
        color: metric.color,
        experiment: metric.run.experiment_name,
        run: metric.run.name,
        metric: metric.metric_name,
        context: Object.entries(metric.context).map((entry) => entry.join(':')),
        value: `${
          closestIndex === null ? '-' : metric.data.values[closestIndex]
        }`,
        iteration: `${
          closestIndex === null ? '-' : metric.data.iterations[closestIndex]
        }`,
      };
    }),
  );
}

const metricsCollectionModel = {
  ...model,
  initialize,
  getMetricsData,
  getDataAsLines,
  getDataAsTableRows,
};

export default metricsCollectionModel;
