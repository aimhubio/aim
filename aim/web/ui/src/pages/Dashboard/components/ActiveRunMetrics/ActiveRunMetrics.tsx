// components/ActiveRunMetrics/ActiveRunMetrics.tsx
import React, { useEffect } from 'react';
import _ from 'lodash-es';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';

import RunDetailMetricsAndSystemTab from 'pages/RunDetail/RunDetailMetricsAndSystemTab';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import './ActiveRunMetrics.scss';

interface IActiveRunMetricsProps {
  runHash: string;
}

function ActiveRunMetrics({
  runHash,
}: IActiveRunMetricsProps): React.FunctionComponentElement<React.ReactNode> {
  const runData = useModel(runDetailAppModel);

  useEffect(() => {
    // Initialize and fetch run data
    runDetailAppModel.initialize();
    const runInfoRequest = runDetailAppModel.getRunInfo(runHash);
    runInfoRequest.call().then(() => {
      // After getting run info, check if we need to load metrics batch
      const state = runDetailAppModel.getState();
      if (state.runTraces?.metric?.length > 0) {
        const metricsBatchRequest = runDetailAppModel.getRunMetricsBatch(
          {
            names: state.runTraces.metric.map((m: any) => m.name),
            context: {},
          },
          runHash,
        );
        metricsBatchRequest.call();
      }
    });

    // Cleanup
    return () => {
      runDetailAppModel.initialize(); // Reset the model
    };
  }, [runHash]);
  const isLoading = runData?.isRunInfoLoading || runData?.isRunBatchLoading;
  const hasNoMetrics =
    !runData?.runTraces?.metric?.length && !runData?.runMetricsBatch?.length;

  return (
    <ErrorBoundary>
      <div className='ActiveRunMetrics'>
        <BusyLoaderWrapper isLoading={isLoading} height='400px'>
          <div className='ActiveRunMetrics__content RunDetail__runDetailContainer__tabPanel'>
            <RunDetailMetricsAndSystemTab
              runHash={runHash}
              runTraces={runData?.runTraces}
              runBatch={runData?.runMetricsBatch}
              isRunBatchLoading={runData?.isRunBatchLoading}
              showPin={false}
            />
          </div>
        </BusyLoaderWrapper>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(ActiveRunMetrics);
