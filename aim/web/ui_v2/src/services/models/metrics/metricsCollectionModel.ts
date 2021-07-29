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
  IGetDataAsLinesProps,
  IMetricCollectionModelState,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsCollectionModel';
import { ILine } from 'types/components/LineChart/LineChart';
import getClosestValue from 'utils/getClosestValue';
import {
  calculateCentralMovingAverage,
  calculateExponentialMovingAverage,
  SmoothingAlgorithmEnum,
} from 'utils/smoothingData';
import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

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
  const { call, abort } = metricsService.getMetricsData({
    q: 'run.get(("hparams", "benchmark")) == "glue" and context.get("subset") != "train" and run.get(("hparams", "dataset")) == "cola"',
  });
  return {
    call: async () => {
      const stream = await call();
      let gen = adjustable_reader(stream);
      let buffer_pairs = decode_buffer_pairs(gen);
      let decodedPairs = decodePathsVals(buffer_pairs);
      let objects = iterFoldTree(decodedPairs, 2);

      const runContainers: IRun[] = [];
      for await (let [keys, val] of objects) {
        runContainers.push(val as any);
      }

      model.setState({
        rawData: runContainers,
        collection: processData(runContainers),
      });
    },
    abort,
  };
}

function processData(data: IRun[]): IMetric[][] {
  let metrics: IMetric[] = [];
  let index = -1;

  data.forEach((run: IRun) => {
    metrics = metrics.concat(
      run.traces.map((trace) => {
        index++;
        return createMetricModel({
          metric_name: trace.metric_name,
          context: trace.context,
          data: {
            values: new Float64Array(trace.values.blob),
            iterations: new Float64Array(trace.iters.blob),
            epochs: new Float64Array(trace.epochs.blob),
            timestamps: new Float64Array(trace.timestamps.blob),
          },
          run: createRunModel(_.omit(run, 'traces') as IRun),
          selectors: [
            encode({
              runHash: run.hash,
              metricName: trace.metric_name,
              metricContext: trace.context,
            }),
            encode({
              runHash: run.hash,
              metricName: trace.metric_name,
              metricContext: trace.context,
            }),
            run.hash,
          ],
          key: encode({
            runHash: run.hash,
            metricName: trace.metric_name,
            traceContext: trace.context,
          }),
          dasharray: '0',
          color: COLORS[index % COLORS.length],
        } as IMetric);
      }),
    );
  });
  return [
    metrics.filter((_, i) => i % 3 === 0),
    metrics.filter((_, i) => i % 3 !== 0),
  ];
}

function getDataAsLines(props: IGetDataAsLinesProps | null = null): ILine[][] {
  const metricsCollection = model.getState()?.collection;
  if (!metricsCollection) {
    return [];
  }

  return metricsCollection.map((metrics: IMetric[]) =>
    metrics.map((metric: IMetric) => {
      let yValues;
      if (props) {
        yValues =
          props.smoothingAlgorithm === SmoothingAlgorithmEnum.EMA
            ? calculateExponentialMovingAverage(
                [...metric.data.values],
                props.smoothingFactor,
              )
            : calculateCentralMovingAverage(
                [...metric.data.values],
                props.smoothingFactor,
              );
      } else {
        yValues = [...metric.data.values];
      }
      return {
        ...metric,
        data: {
          xValues: [...metric.data.iterations],
          yValues,
        },
      };
    }),
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
        // experiment: metric.run.experiment_name,
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
