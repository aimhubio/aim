import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import { getValue } from 'utils/helper';

import useRunMetricsBatch from '../hooks/useRunMetricsBatch';

import RunOverviewTabCLIArgumentsCard from './components/CLIArgumentsCard/RunOverviewTabCLIArgumentsCard';
import RunOverviewSidebar from './components/RunOverviewSidebar/RunOverviewSidebar';
import RunOverviewTabParamsCard from './components/ParamsCard/RunOverviewTabParamsCard';
import RunOverviewTabMetricsCard from './components/MetricsCard/RunOverviewTabMetricsCard';
import RunOverviewTabPackagesCard from './components/Packages/RunOverviewTabPackagesCard';

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
          <RunOverviewTabPackagesCard
            packages={getValue(
              runData,
              ['runParams', '__system_params', 'packages'],
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
