import { omit } from 'lodash-es';

import { createFindDataRequest } from 'modules/core/api/dataFetchApi';
// import {
//   DecodingError,
//   FetchingError,
// } from 'modules/core/pipeline/query/QueryError';
// import AdapterError from 'modules/core/pipeline/adapter/AdapterError';

import pyodideEngine from 'services/pyodide/store';
import {
  getPendingQueriesMap,
  getQueryResultsCacheMap,
} from 'services/pyodide/pyodide';

import { parseStream } from 'utils/encoder/streamEncoding';
import { filterMetricsValues } from 'utils/app/filterMetricData';

export function find(
  boardPath: string,
  type_: string,
  isSequence: boolean,
  hash_: string,
  name?: string,
  ctx?: string,
  cb?: () => void,
) {
  const queryKey = `${type_}_${hash_}_${name ?? 'None'}_${ctx ?? 'None'}`;

  if (getQueryResultsCacheMap().has(queryKey)) {
    return getQueryResultsCacheMap().get(queryKey).data;
  }

  const findRequest = createFindDataRequest(!isSequence);

  if (getPendingQueriesMap().has(boardPath)) {
    let pendinqQueries = getPendingQueriesMap().get(boardPath);
    if (pendinqQueries) {
      if (pendinqQueries.has(queryKey)) {
        return;
      }

      pendinqQueries.set(queryKey, findRequest.cancel);
    }
  } else {
    getPendingQueriesMap().set(
      boardPath,
      new Map([[queryKey, findRequest.cancel]]),
    );
  }

  pyodideEngine.events.fire(
    boardPath as string,
    {
      queryDispatchedKey: queryKey,
    },
    { savePayload: false },
  );

  findRequest
    .call({
      type_,
      hash_,
      name,
      ctx,
    })
    .then((data) => {
      if (getPendingQueriesMap().has(boardPath)) {
        let pendinqQueries = getPendingQueriesMap().get(boardPath);
        if (pendinqQueries) {
          if (pendinqQueries.has(queryKey)) {
            pendinqQueries.delete(queryKey);
          }
        }
      }
      parseStream<Array<any>>(data)
        .then((objectList) => {
          try {
            let result = objectList[0];

            if (cb) {
              cb();
            }

            const queryParams = {
              boardPath,
              type_,
              isSequence,
              hash_,
              name,
              ctx,
            };

            getQueryResultsCacheMap().set(queryKey, {
              data: JSON.stringify(result),
              params: queryParams,
              type: 'find',
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
