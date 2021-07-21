import { IRun } from 'types/services/models/metrics/runModel';
import API from '../api';
import generateMetrics from './metricsMock';

const endpoints = {
  GET_METRICS: 'commits/search/metric',
};

function getMetricsData(params: {}) {
  return API.getStream<IRun[]>(endpoints.GET_METRICS, params);
  // return {
  //   call: () => ({
  //     then: (resolve: (data: IRun[]) => void, reject?: unknown) => {
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
