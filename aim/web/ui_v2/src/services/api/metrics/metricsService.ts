import { IRun } from 'types/services/models/metrics/runModel';
import API from '../api';
import generateMetrics from './metricsMock';

const endpoints = {
  GET_METRICS: '/metrics',
};

function getMetricsData() {
  // return API.get<unknown>(endpoints.SEARCH_METRICS);
  return {
    call: () => ({
      then: (resolve: (data: IRun[]) => void, reject?: unknown) => {
        setTimeout(() => {
          const mock = generateMetrics(100, 50);
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
