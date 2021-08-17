import API from '../api';

const endpoints = {
  GET_PARAMS: 'runs/search/run',
};

function getParamsData() {
  return API.getStream<ReadableStream>(endpoints.GET_PARAMS);
}

const paramsService = {
  endpoints,
  getParamsData,
};

export default paramsService;
