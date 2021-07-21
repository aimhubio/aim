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
    call: () =>
      call()
        .then((data: any) => {
          const metricsResult = {};
          const reader = data.getReader();
          return new ReadableStream({
            start(controller) {
              function push() {
                // "done" is a Boolean and value a "Uint8Array"
                reader.read().then((params: any) => {
                  const { done, value } = params;
                  // If there is no more data to read
                  if (done) {
                    console.log('done', done);
                    controller.close();
                    return;
                  }
                  // Get the data and send it to the browser via the controller
                  controller.enqueue(value);
                  // Check chunks by logging to the console
                  console.log(done, value);
                  push();
                });
              }

              push();
            },
          });
        })
        .then((stream) => {
          // Respond with our stream
          return new Response(stream, {
            headers: { 'Content-Type': 'application/json' },
          }).json();
        })
        .then((data) => {
          console.log(data);
          // model.setState({
          //   rawData: data,
          //   collection: processData(data),
          // });
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
          selectors: [
            encode({
              runHash: run.run_hash,
              metricName: metric.metric_name,
              metricContext: metric.context,
            }),
            encode({
              runHash: run.run_hash,
              metricName: metric.metric_name,
              metricContext: metric.context,
            }),
            run.run_hash,
          ],
          key: encode({
            runHash: run.run_hash,
            metricName: metric.metric_name,
            traceContext: metric.context,
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
