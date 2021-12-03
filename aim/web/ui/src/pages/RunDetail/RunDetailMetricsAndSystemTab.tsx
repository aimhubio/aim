import React, { memo } from 'react';
import { isEmpty, isNil } from 'lodash-es';

import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import { IRunBatch, IRunDetailMetricsAndSystemTabProps } from './types';
import RunMetricCard from './RunMetricCard';

function RunDetailMetricsAndSystemTab({
  runHash,
  runTraces,
  runBatch,
  isSystem,
  isRunBatchLoading,
}: IRunDetailMetricsAndSystemTabProps): React.FunctionComponentElement<React.ReactNode> {
  React.useEffect(() => {
    if (!runBatch && !isNil(runTraces)) {
      const runsBatchRequestRef = runDetailAppModel.getRunMetricsBatch(
        runTraces.metric,
        runHash,
      );
      runsBatchRequestRef.call();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runTraces, runHash]);

  return (
    <div className='RunDetailMetricsTab'>
      <BusyLoaderWrapper
        isLoading={isRunBatchLoading}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {runBatch && (
          <div className='RunDetailMetricsTab__container'>
            {!isEmpty(runBatch) ? (
              runBatch.map((batch: IRunBatch, i: number) => {
                return <RunMetricCard batch={batch} index={i} key={i} />;
              })
            ) : (
              <EmptyComponent
                size='big'
                className='runDetailParamsTabLoader'
                content={`No tracked ${isSystem ? 'system' : ''} metrics`}
              />
            )}
          </div>
        )}
      </BusyLoaderWrapper>
    </div>
  );
}

export default memo(RunDetailMetricsAndSystemTab);
