import { createFetchDataRequest } from 'modules/core/api/dataFetchApi';
import {
  DecodingError,
  FetchingError,
} from 'modules/core/pipeline/query/QueryError';
import AdapterError from 'modules/core/pipeline/adapter/AdapterError';

import pyodideEngine from 'services/pyodide/store';

import { parseStream } from 'utils/encoder/streamEncoding';
import { filterMetricsValues } from 'utils/app/filterMetricData';

const searchRequests = createFetchDataRequest();

const queryResultCacheMap: Record<string, any> = {};

export function search(
  boardPath: string,
  type_: string,
  query: string,
  isSequence: boolean,
) {
  const queryKey = `${type_}_${query}`;

  if (queryResultCacheMap.hasOwnProperty(queryKey)) {
    return queryResultCacheMap[queryKey];
  }

  searchRequests
    .call({
      q: query,
      type_: type_,
      report_progress: false,
    })
    .then((data) => {
      parseStream<Array<any>>(data, undefined, 0)
        .then((objectList) => {
          try {
            let result;
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
              result = objectList;
            }

            queryResultCacheMap[queryKey] = result;

            pyodideEngine.events.fire(
              boardPath as string,
              {
                query: queryKey,
              },
              { savePayload: false },
            );
          } catch (err: any) {
            throw new AdapterError(err.message || err, err.detail);
          }
        })
        .catch((err: any) => {
          throw new DecodingError(err.message || err, err.detail);
        });
    })
    .catch((err: any) => {
      throw new FetchingError(err.message || err, err.detail);
    });

  throw 'WAIT_FOR_QUERY_RESULT';
}
