import React, { memo } from 'react';
import _ from 'lodash-es';

import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { IRunBatch, IRunDetailMetricsAndSystemTabProps } from './types';
import RunMetricCard from './RunMetricCard';
import useRunMetricsBatch from './hooks/useRunMetricsBatch';

function RunDetailMetricsAndSystemTab({
  runHash,
  runTraces,
  runBatch,
  isSystem,
  isRunBatchLoading,
}: IRunDetailMetricsAndSystemTabProps): React.FunctionComponentElement<React.ReactNode> {
  useRunMetricsBatch({ runBatch, runTraces, runHash });

  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs[isSystem ? 'system' : 'metrics']
        .tabView,
    );
  }, [isSystem]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunBatchLoading}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        {!_.isEmpty(runBatch) ? (
          <div className='RunDetailMetricsTab'>
            <div className='RunDetailMetricsTab__container'>
              {runBatch.map((batch: IRunBatch, i: number) => {
                return (
                  <RunMetricCard key={batch.key} batch={batch} index={i} />
                );
              })}
            </div>
          </div>
        ) : (
          <IllustrationBlock
            size='xLarge'
            className='runDetailParamsTabLoader'
            title={`No tracked ${isSystem ? 'system' : ''} metrics`}
          />
        )}
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

export default memo(RunDetailMetricsAndSystemTab);
