import { createRunLogRecordsRequest } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

import { parseStream } from 'utils/encoder/streamEncoding';

import { RunLogRecordStateType } from '.';

function createRunLogRecordsEngine() {
  const { call } = createRunLogRecordsRequest();

  const { fetchData, state, destroy } = createResource<RunLogRecordStateType>(
    async ({ runId, record_range }: { runId: string; record_range?: string }) =>
      parseStream(await call(runId, record_range), {
        dataProcessor: async (objects: any) => {
          const data: RunLogRecordStateType = {
            runLogRecordsList: [],
            runLogRecordsTotalCount: 0,
          };
          try {
            for await (let [keys, val] of objects) {
              const object = { ...val, hash: keys[0] };
              if (typeof object.hash === 'number') {
                data.runLogRecordsList.push(object);
              } else {
                data.runLogRecordsTotalCount = val;
              }
            }
          } catch (e) {
            console.error(e);
            throw e;
          }
          return data;
        },
      }),
  );
  return {
    fetchRunLogRecords: (options: { runId: string; record_range?: string }) =>
      fetchData(options),
    runLogRecordsState: state,
    destroy,
  };
}

export default createRunLogRecordsEngine();
