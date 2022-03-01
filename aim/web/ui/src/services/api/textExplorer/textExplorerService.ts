import { IApiRequest } from 'types/services/services';

import API from '../api';

const endpoints = {
  GET_TEXT: 'runs/search/texts',
};

function getTextExplorerData(params: {}): IApiRequest<ReadableStream> {
  return API.getStream<ReadableStream>(endpoints.GET_TEXT, params);
}

const textsExploreService = {
  endpoints,
  getTextExplorerData,
};

export default textsExploreService;
