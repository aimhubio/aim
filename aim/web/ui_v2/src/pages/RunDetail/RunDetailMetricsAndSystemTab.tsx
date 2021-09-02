import React, { memo } from 'react';
import { isEmpty } from 'lodash-es';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import {
  IRunBatch,
  IRunDetailMetricsAndSystemTabProps,
} from 'types/pages/runs/Runs';
import RunMetricCard from './RunMetricCard';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';

function RunDetailMetricsAndSystemTab({
  runHash,
  runTraces,
  runBatch,
  isSystem,
}: IRunDetailMetricsAndSystemTabProps): React.FunctionComponentElement<React.ReactNode> {
  React.useEffect(() => {
    if (!runBatch) {
      const runsBatchRequestRef = runDetailAppModel.getRunBatch(
        runTraces,
        runHash,
      );
      runsBatchRequestRef.call();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTraces, runHash]);

  return (
    <div className='RunDetailMetricsTab'>
      {runBatch && (
        <div className='RunDetailMetricsTab__container'>
          {!isEmpty(runBatch) ? (
            runBatch.map((batch: IRunBatch, i: number) => {
              return <RunMetricCard batch={batch} index={i} key={i} />;
            })
          ) : (
            <EmptyComponent
              size='big'
              content={`No tracked ${isSystem ? 'system' : ''} metrics`}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default memo(RunDetailMetricsAndSystemTab);
