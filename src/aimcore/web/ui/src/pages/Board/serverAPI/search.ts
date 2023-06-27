import { omit } from 'lodash-es';

import { createFetchDataRequest } from 'modules/core/api/dataFetchApi';
// import {
//   DecodingError,
//   FetchingError,
// } from 'modules/core/pipeline/query/QueryError';
// import AdapterError from 'modules/core/pipeline/adapter/AdapterError';

import pyodideEngine from 'services/pyodide/store';
import { getQueryResultsCacheMap } from 'services/pyodide/pyodide';

import { parseStream } from 'utils/encoder/streamEncoding';
import { filterMetricsValues } from 'utils/app/filterMetricData';

const searchRequest = createFetchDataRequest();

export function search(
  boardPath: string,
  type_: string,
  query: string,
  count: number,
  start: number,
  stop: number,
  isSequence: boolean,
  cb?: () => void,
) {
  const queryKey = `${type_}_${query ?? 'None'}_${count ?? 'None'}_${
    start ?? 'None'
  }_${stop ?? 'None'}`;

  if (getQueryResultsCacheMap().has(queryKey)) {
    return getQueryResultsCacheMap().get(queryKey).data;
  }

  searchRequest
    .call({
      q: query,
      type_: type_,
      p: count,
      start: start,
      stop: stop,
      report_progress: false,
    })
    .then((data) => {
      parseStream<Array<any>>(data)
        .then((objectList) => {
          try {
            let result = [];
            if (type_.includes('.Metric')) {
              let data: any[] = [];

              for (let i = 0; i < objectList.length; i++) {
                let item = objectList[i];
                const { values, steps } = filterMetricsValues(item);
                if (values.length === 0 || steps.length === 0) {
                  continue;
                }
                data.push({
                  ...item,
                  values: [...values],
                  steps: [...steps],
                });
              }

              result = data;
            } else if (isSequence) {
              let data: any[] = [];

              for (let i = 0; i < objectList.length; i++) {
                if (!objectList[i].values) {
                  continue;
                }

                for (let y = 0; y < objectList[i].values.length; y++) {
                  let object = objectList[i].values[y];
                  let step = objectList[i].steps[y];
                  if (Array.isArray(object)) {
                    for (let z = 0; z < object.length; z++) {
                      object[z] = {
                        ...object[z],
                        step: step,
                      };
                      data.push({
                        ...objectList[i],
                        ...object[z],
                        step: step,
                        index: z,
                      });
                    }
                  } else {
                    data.push({
                      ...objectList[i],
                      ...object,
                      step: step,
                      index: 0,
                    });
                  }
                }
              }

              result = data;
            } else {
              for (let item of objectList) {
                result.push({
                  ...omit(item, ['params']),
                  ...item.params,
                });
              }
            }

            if (cb) {
              cb();
            }

            const queryParams = {
              boardPath,
              type_,
              query,
              count,
              start,
              stop,
              isSequence,
            };

            getQueryResultsCacheMap().set(queryKey, {
              data: result,
              params: queryParams,
            });

            pyodideEngine.events.fire(
              boardPath as string,
              {
                queryKey,
              },
              { savePayload: false },
            );
          } catch (err: any) {
            // throw new AdapterError(err.message || err, err.detail);
          }
        })
        .catch((err: any) => {
          // throw new DecodingError(err.message || err, err.detail);
        });
    })
    .catch((err: any) => {
      // throw new FetchingError(err.message || err, err.detail);
    });

  throw 'WAIT_FOR_QUERY_RESULT';
}
