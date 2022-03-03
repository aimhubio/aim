import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import RunOverviewTabParamsCard from './RunOverviewTabParamsCard';
import RunOverviewTabMetricsCard from './RunOverviewTabMetricsCard';

import './RunOverViewTab.scss';

function RunOverviewTab({ runData, runHash }: any) {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'>
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
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
