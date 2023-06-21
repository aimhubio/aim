import { createRunFunctionRequest } from 'modules/core/api/dataFetchApi';
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

const runFunctionRequest = createRunFunctionRequest();

export function runFunction(
  boardPath: string,
  funcName: string,
  requestData: Record<string, any>,
) {
  const runFunctionKey = `${funcName}_${JSON.stringify(requestData)}`;

  if (getQueryResultsCacheMap().has(runFunctionKey)) {
    return getQueryResultsCacheMap().get(runFunctionKey).data;
  }

  const reqBody = pyodideJSProxyMapToObject(requestData.toJs());

  runFunctionRequest
    .call(funcName, reqBody)
    .then((res: any) => {
      const { headers, body } = res;
      const isGenerator = headers.get('is-generator') === 'True';
      parseStream<Array<any>>(body, undefined, 1, true, isGenerator)
        .then((result) => {
          try {
            const queryParams = {
              boardPath,
              funcName,
              requestData: reqBody,
            };

            getQueryResultsCacheMap().set(runFunctionKey, {
              data: result,
              params: queryParams,
            });

            pyodideEngine.events.fire(
              boardPath,
              {
                runFunctionKey,
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
