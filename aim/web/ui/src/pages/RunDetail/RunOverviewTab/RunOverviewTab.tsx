import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import RunOverviewSidebar from './RunOverviewSidebar/RunOverviewSidebar';
import RunOverviewTabParamsCard from './RunOverviewTabParamsCard';
import RunOverviewTabMetricsCard from './RunOverviewTabMetricsCard';

import './RunOverViewTab.scss';

function RunOverviewTab({ runData, runHash }: any) {
  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs['overview'].tabView,
    );
  }, []);

  return (
    <ErrorBoundary>
      <section className='RunOverViewTab'>
        <div className='RunOverViewTab__content'>
          <RunOverviewTabMetricsCard
            runData={runData}
            type='metric'
            runHash={runHash}
            runBatch={runData?.runMetricsBatch}
          />
          <RunOverviewTabParamsCard runData={runData} />
          <RunOverviewTabMetricsCard
            runData={runData}
            type='systemMetric'
            runHash={runHash}
            runBatch={runData?.runSystemBatch}
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
