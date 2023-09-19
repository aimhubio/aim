import { createRunActionRequest } from 'modules/core/api/dataFetchApi';
// import {
//   DecodingError,
//   FetchingError,
// } from 'modules/core/pipeline/query/QueryError';
// import AdapterError from 'modules/core/pipeline/adapter/AdapterError';

import pyodideEngine from 'services/pyodide/store';
import {
  getQueryResultsCacheMap,
  pyodideJSProxyMapToObject,
} from 'services/pyodide/pyodide';

import { parseStream } from 'utils/encoder/streamEncoding';

const runActionRequest = createRunActionRequest();

export function runAction(
  boardPath: string,
  actionName: string,
  requestData: Record<string, any>,
) {
  const reqBody = pyodideJSProxyMapToObject(requestData.toJs());

  const runActionKey = `${actionName}_${JSON.stringify(reqBody)}`;

  if (getQueryResultsCacheMap().has(runActionKey)) {
    return getQueryResultsCacheMap().get(runActionKey).data;
  }

  pyodideEngine.events.fire(
    boardPath,
    {
      runActionDispatchedKey: runActionKey,
    },
    { savePayload: false },
  );

  runActionRequest
    .call(actionName, reqBody)
    .then((res: any) => {
      const { headers, body } = res;
      const isGenerator = headers.get('is-generator') === 'True';
      parseStream<Array<any>>(body, undefined, 1, true, isGenerator)
        .then((result) => {
          try {
            const queryParams = {
              boardPath,
              actionName,
              requestData: reqBody,
            };

            getQueryResultsCacheMap().set(runActionKey, {
              data: JSON.stringify({ value: result }),
              params: queryParams,
            });

            pyodideEngine.events.fire(
              boardPath,
              {
                runActionKey,
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
