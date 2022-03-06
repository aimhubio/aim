import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import RunOverviewTabCLIArgumentsCard from 'pages/RunDetail/RunOverviewTab/components/CLIArgumentsCard/RunOverviewTabCLIArgumentsCard';
import RunOverviewSidebar from 'pages/RunDetail/RunOverviewTab/components/RunOverviewSidebar/RunOverviewSidebar';
import RunOverviewTabParamsCard from 'pages/RunDetail/RunOverviewTab/components/ParamsCard/RunOverviewTabParamsCard';
import RunOverviewTabMetricsCard from 'pages/RunDetail/RunOverviewTab/components/MetricsCard/RunOverviewTabMetricsCard';
import useRunMetricsBatch from 'pages/RunDetail/hooks/useRunMetricsBatch';

import * as analytics from 'services/analytics';

import { getValue } from 'utils/helper';

import './RunOverviewTab.scss';

function RunOverviewTab({ runData, runHash }: any) {
  useRunMetricsBatch({
    runBatch: runData.runMetricsBatch,
    runTraces: runData.runTraces,
    runHash,
  });

  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs['overview'].tabView,
    );
  }, []);

  return (
    <ErrorBoundary>
      <section className='RunOverviewTab'>
        <div className='RunOverviewTab__content'>
          <RunOverviewTabMetricsCard
            isLoading={runData?.isRunBatchLoading}
            type='metric'
            runBatch={runData?.runMetricsBatch}
          />
          <RunOverviewTabParamsCard
            runParams={runData?.runParams}
            isRunInfoLoading={runData?.isRunInfoLoading}
          />
          <RunOverviewTabMetricsCard
            isLoading={runData?.isRunBatchLoading}
            type='systemMetric'
            runBatch={runData?.runSystemBatch}
          />
          <RunOverviewTabCLIArgumentsCard
            cliArguments={getValue(
              runData,
              ['runParams', '__system_params', 'arguments'],
              null,
            )}
            isRunInfoLoading={runData?.isRunInfoLoading}
          />
        </div>
        <RunOverviewSidebar
          runHash={runHash}
          info={runData.runInfo}
          traces={runData.runTraces}
        />
      </section>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
