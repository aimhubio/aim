import API from '../api';
import {
  IBookmarkData,
  IBookmarkRequestBody,
} from 'types/services/models/metrics/metricsAppModel';

const endpoints = {
  CREATE_DASHBOARD: '/dashboards',
};

function createBookmark() {
  return {
    call: (reqBody: IBookmarkRequestBody) => ({
      then: (resolve: (data: IBookmarkData) => void, reject?: unknown) => {
        API.post(endpoints.CREATE_DASHBOARD, reqBody)
          .call()
          .then((res: any) => {
            resolve(res);
          });
      },
    }),
    abort: () => null,
  };
}

const dashboardService = {
  endpoints,
  createBookmark,
};

export default dashboardService;
