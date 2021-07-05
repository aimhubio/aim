import API from '../api';
import metricsMock from './metricsMock';

const endpoints = {
  GET_METRICS: '/metrics',
};

function getMetricsData() {
  // return API.get<unknown>(endpoints.SEARCH_METRICS);
  return {
    call: () => ({
      then: (resolve: (data: unknown) => void, reject?: unknown) => {
        setTimeout(() => {
          resolve(metricsMock);
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
