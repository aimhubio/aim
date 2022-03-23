import React from 'react';
import _ from 'lodash-es';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

function useRunMetricsBatch({ runBatch, runTraces, runHash }: any) {
  React.useEffect(() => {
    const runsBatchRequestRef = runDetailAppModel.getRunMetricsBatch(
      runTraces.metric,
      runHash,
    );
    if (!runBatch && !_.isNil(runTraces)) {
      runsBatchRequestRef.call();
    }
    return () => {
      runsBatchRequestRef.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTraces, runHash]);
}

export default useRunMetricsBatch;
