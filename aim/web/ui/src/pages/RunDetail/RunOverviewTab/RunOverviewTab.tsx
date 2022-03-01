import React from 'react';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';

import GitInfoCard from './GitInfoCard';
import RunOverviewSidebar from './RunOverviewSidebar/RunOverviewSidebar';

import './RunOverViewTab.scss';

function RunOverviewTab(props: any) {
  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs['overview'].tabView,
    );
  }, []);

  return (
    <section className='RunOverViewTab'>
      <div className='RunOverViewTab__content'>
        <GitInfoCard />
      </div>
      <RunOverviewSidebar
        runHash={props.runHash}
        info={props.runData.runInfo}
        traces={props.runData.runTraces}
      />
    </section>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
