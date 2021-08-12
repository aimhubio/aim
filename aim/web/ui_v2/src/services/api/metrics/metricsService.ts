import generateMetrics from './metricsMock';
import { IRun } from 'types/services/models/metrics/runModel';

const endpoints = {
  GET_METRICS: '/metrics',
};

function getMetricsData() {
  // return API.get<unknown>(endpoints.SEARCH_METRICS);
  return {
    call: () => ({
      then: (resolve: (data: IRun[]) => void, reject?: unknown) => {
        setTimeout(() => {
          const mock = generateMetrics(50, 200);
          resolve(mock);
        }, 1000);
      },
    }),
    abort: () => null,
  };
}

const metricsService = {
  endpoints,
  getMetricsData,
};

export default metricsService;
