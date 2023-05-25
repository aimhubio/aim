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

export function search(boardPath: string, sequenceType: string, query: string) {
  const queryKey = `${sequenceType}_${query}`;

  if (queryResultCacheMap.hasOwnProperty(queryKey)) {
    return queryResultCacheMap[queryKey];
  }

  searchRequests
    .call({
      q: query,
      type_: sequenceType,
      report_progress: false,
    })
    .then((data) => {
      parseStream<Array<any>>(data, undefined, 0)
        .then((objectList) => {
          try {
            let result;
            if (
              sequenceType.includes('.Metric') ||
              sequenceType === 'Sequence'
            ) {
              result = objectList.map((item: any) => {
                const { values, steps } = filterMetricsValues(item);
                return {
                  ...item,
                  values: [...values],
                  steps: [...steps],
                };
              });
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
