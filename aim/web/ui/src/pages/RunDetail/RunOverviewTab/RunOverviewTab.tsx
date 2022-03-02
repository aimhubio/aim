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

  const systemParams = props.runData.runParams['__system_params'];

  return (
    <section className='RunOverViewTab'>
      <div className='RunOverViewTab__content'>
        {systemParams && systemParams['git_info'] && (
          <GitInfoCard data={systemParams['git_info']} />
        )}
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
