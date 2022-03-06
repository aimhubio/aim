import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import useRunMetricsBatch from '../useRunMetricsBatch';

import GitInfoCard from './GitInfoCard';
import RunOverviewSidebar from './RunOverviewSidebar/RunOverviewSidebar';
import RunOverviewTabParamsCard from './RunOverviewTabParamsCard';
import RunOverviewTabMetricsCard from './RunOverviewTabMetricsCard';

import './RunOverViewTab.scss';

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

  const systemParams = runData.runParams['__system_params'];

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
          {_.isEmpty(systemParams?.['git_info']) ? null : (
            <GitInfoCard data={systemParams?.['git_info']} />
          )}
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
