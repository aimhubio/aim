import * as _ from 'lodash-es';

import COLORS from 'config/colors/colors';
import metricsService from 'services/api/metrics/metricsService';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IRun } from 'types/services/models/metrics/runModel';
import createModel from '../model';
import createMetricModel from './metricModel';
import { createRunModel } from './runModel';
import { traceToHash } from 'utils/toHash';

const model = createModel({});

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
      call().then((data: any) => {
        model.setState({
          rawData: data,
          collection: processData(data),
        });
      }),
    abort,
  };
}

function processData(data: any) {
  let metrics: IMetric[] = [];
  let index = -1;
  data.forEach((run: any) => {
    metrics = metrics.concat(
      run.metrics.map((metric: IMetric) => {
        index++;
        return createMetricModel({
          ...metric,
          run: createRunModel(_.omit(run, 'metrics') as IRun),
          key: traceToHash(run.run_hash, metric.metric_name, metric.context),
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

const metricsCollectionModel = {
  ...model,
  initialize,
  getMetricsData,
};

export default metricsCollectionModel;
