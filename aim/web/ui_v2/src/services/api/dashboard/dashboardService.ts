import API from '../api';
import { IBookmarkRequestBody } from 'types/services/models/metrics/metricsAppModel';

const endpoints = {
  CREATE_DASHBOARD: 'dashboards',
};

function createBookmark(reqBody: IBookmarkRequestBody) {
  return API.post(endpoints.CREATE_DASHBOARD, reqBody);
}

function fetchBookmarks() {
  return API.get(endpoints.CREATE_DASHBOARD);
}

const dashboardService = {
  endpoints,
  createBookmark,
  fetchBookmarks,
};

export default dashboardService;
