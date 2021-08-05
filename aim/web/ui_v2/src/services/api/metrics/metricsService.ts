import API from '../api';
import generateMetrics from './metricsMock';
import { IRun } from 'types/services/models/metrics/runModel';
import {
  IAppData,
  IAppRequestBody,
  IBookmarkData,
  IBookmarkRequestBody,
} from 'types/services/models/metrics/metricsAppModel';
import { IBookmarkFormState } from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';

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

function createApp() {
  return {
    call: (reqBody: IAppRequestBody) => ({
      then: (resolve: (data: IAppData) => void, reject?: unknown) => {
        API.post('apps', reqBody)
          .call()
          .then((res: any) => {
            resolve(res);
          });
      },
    }),
    abort: () => null,
  };
}

function createBookmark() {
  return {
    call: (reqBody: IBookmarkRequestBody) => ({
      then: (resolve: (data: IBookmarkData) => void, reject?: unknown) => {
        API.post('dashboards', reqBody)
          .call()
          .then((res: any) => {
            resolve(res);
          });
      },
    }),
    abort: () => null,
  };
}

const metricsService = {
  endpoints,
  getMetricsData,
  createApp,
  createBookmark,
};

export default metricsService;
