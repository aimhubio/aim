import API from '../api';
import { IApiRequest } from 'types/services/services';
// import generateMetrics from './metricsMock';
// import { IRun } from 'types/services/models/metrics/runModel';

const endpoints = {
  GET_METRICS: 'runs/search/metric',
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

const metricsService = {
  endpoints,
  getMetricsData,
};

export default metricsService;
