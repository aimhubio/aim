import React from 'react';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

function useRunMetricsBatch({ runTraces, runHash }: any) {
  React.useEffect(() => {
    const runsBatchRequestRef = runDetailAppModel.getRunMetricsBatch(
      runTraces.metric,
      runHash,
    );

    runsBatchRequestRef.call();

    return () => {
      runsBatchRequestRef.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTraces, runHash]);
}

export default useRunMetricsBatch;
