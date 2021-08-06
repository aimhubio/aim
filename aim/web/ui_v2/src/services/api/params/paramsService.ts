import { mockData, mockData2 } from './paramsMock';

const endpoints = {
  GET_PARAMS: '/params',
};

function getParamsData() {
  // return API.get<unknown>(endpoints.SEARCH_METRICS);
  return {
    call: () => ({
      then: (resolve: (data: any) => void, reject?: unknown) => {
        setTimeout(() => {
          resolve([mockData, mockData2]);
        }, 1000);
      },
    }),
    abort: () => null,
  };
}

const paramsService = {
  endpoints,
  getParamsData,
};

export default paramsService;
