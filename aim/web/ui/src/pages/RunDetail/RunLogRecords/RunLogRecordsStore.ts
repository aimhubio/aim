import { createRunLogRecordsRequest } from 'modules/core/api/runsApi';
import createResource from 'modules/core/utils/createResource';

import { parseStream } from 'utils/encoder/streamEncoding';

function createRunLogRecordsEngine() {
  const { call } = createRunLogRecordsRequest();

  const { fetchData, state, destroy } = createResource<any[]>(
    async ({ runId, record_range }: { runId: string; record_range?: string }) =>
      parseStream(await call(runId, record_range)),
  );
  return {
    fetchRunLogRecords: (options: { runId: string; record_range?: string }) =>
      fetchData(options),
    runLogRecordsState: state,
    destroy,
  };
}

export default createRunLogRecordsEngine();
