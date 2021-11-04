import { IApiRequest } from 'types/services/services';
import { IAlignMetricsDataParams } from 'types/services/models/metrics/metricsAppModel';

import API from '../api';
// import generateMetrics from './metricsMock';
// import { IRun } from 'types/services/models/metrics/runModel';

const endpoints = {
  GET_METRICS: 'runs/search/metric',
  GET_ALIGNED_METRICS: 'runs/search/metric/align',
};

function getMetricsData(params: {}): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoints.GET_METRICS, params);

  // We will not remove this part yet, though we will need to refactor mock data structure
  // due to API schema changes

  // return {
  //   call: () => ({
  //     then: (resolve: (data: IRun<IMetricTrace | IParamTrace>[]) => void, reject?: unknown) => {
  //       setTimeout(() => {
  //         const mock = generateMetrics(200, 100);
  //         resolve(mock);
  //       }, 1000);
  //     },
  //   }),
  //   abort: () => null,
  // };
}

function fetchAlignedMetricsData(
  params: IAlignMetricsDataParams,
): IApiRequest<any> {
  return API.getStream<IApiRequest<any>>(
    endpoints.GET_ALIGNED_METRICS,
    params,
    {
      method: 'POST',
    },
  );
}

const metricsService = {
  endpoints,
  getMetricsData,
  fetchAlignedMetricsData,
};

export default metricsService;
