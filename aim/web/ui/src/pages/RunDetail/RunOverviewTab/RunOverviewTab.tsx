import React from 'react';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import useRunMetricsBatch from '../useRunMetricsBatch';

import RunOverviewSidebar from './RunOverviewSidebar/RunOverviewSidebar';

import './RunOverViewTab.scss';

function RunOverviewTab(props: any) {
  useRunMetricsBatch({
    runBatch: props.runBatch,
    runTraces: props.runTraces,
    runHash: props.runHash,
  });

  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs['overview'].tabView,
    );
  }, []);

  return (
    <div>
      <h1>Run Overview</h1>
      <RunOverviewSidebar
        runHash={props.runHash}
        info={props.runData.runInfo}
        traces={props.runData.runTraces}
      />
    </div>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
