import { createFetchDataRequest } from 'modules/core/api/dataFetchApi';
import {
  DecodingError,
  FetchingError,
} from 'modules/core/pipeline/query/QueryError';
import AdapterError from 'modules/core/pipeline/adapter/AdapterError';

import pyodideEngine from 'services/pyodide/store';

import { parseStream } from 'utils/encoder/streamEncoding';
import { AlignmentOptionsEnum } from 'utils/d3';
import { filterMetricsValues } from 'utils/app/filterMetricData';

const seachRequests = createFetchDataRequest();

const queryResultCacheMap: Record<string, any> = {};

export function search(boardId: string, sequenceName: string, query: string) {
  const queryKey = `${sequenceName}_${query}`;

  if (queryResultCacheMap.hasOwnProperty(queryKey)) {
    return queryResultCacheMap[queryKey];
  }

  seachRequests
    .call({
      q: query,
      type_: sequenceName,
      report_progress: false,
    })
    .then((data) => {
      parseStream<Array<any>>(data, undefined, 0)
        .then((objectList) => {
          try {
            let result;
            if (
              sequenceName.includes('.Metric') ||
              sequenceName === 'Sequence'
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
              boardId as string,
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
