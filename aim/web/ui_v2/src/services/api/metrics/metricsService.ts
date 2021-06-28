import API from '../api';

const endpoints = {
  SEARCH_METRICS: '/metrics',
};

function searchMetrics() {
  // return API.get<unknown>(endpoints.SEARCH_METRICS);
  return {
    call: () => ({
      then: (resolve: (data: unknown) => void, reject: unknown) => {
        resolve([
          {
            name: 'foo',
            run_hash: 'ie7huhdiGsGUJNsdh91u92',
            params: {
              hparams: {},
              default: {},
              config: {},
            },
            series: [
              {
                metric_name: 'foo',
                params: {
                  subset: 'test',
                },
                data: {
                  values: new Float64Array([
                    123.234324, 348.234234, 321.1237, 159, 234.47943, 97,
                    178.23423,
                  ]),
                  steps: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
                  epochs: new Uint32Array([0, 0, 1, 1, 1, 2, 2]),
                  iterations: new Uint32Array([0, 1, 2, 3, 4, 5, 6]),
                  timestamp: new Uint32Array([
                    1624564800000, 1624564821000, 1624564834070, 1624564850820,
                    1624564857000, 1624564865427, 1624564876596,
                  ]),
                },
              },
              {
                metric_name: 'foo',
                params: {
                  subset: 'val',
                },
                data: {
                  values: new Float64Array([143.234324, 310.294256, 180]),
                  steps: new Uint32Array([0, 1, 2]),
                  epochs: new Uint32Array([0, 1, 2]),
                  iterations: new Uint32Array([0, 1, 2]),
                  timestamp: new Uint32Array([
                    1624564800000, 1624564850820, 1624564876596,
                  ]),
                },
              },
            ],
          },
        ]);
      },
    }),
    abort: () => null,
  };
}

const mtericsService = {
  endpoints,
  searchMetrics,
};

export default mtericsService;
