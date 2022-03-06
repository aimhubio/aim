import React from 'react';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import CLIArgumentsCard from 'pages/RunDetail/RunOverviewTab/components/CLIArgumentsCard/CLIArgumentsCard';
import RunOverviewSidebar from 'pages/RunDetail/RunOverviewTab/RunOverviewSidebar/RunOverviewSidebar';

import * as analytics from 'services/analytics';

import { getValue } from 'utils/helper';

import './RunOverviewTab.scss';

function RunOverviewTab(props: any) {
  React.useEffect(() => {
    analytics.pageView(
      ANALYTICS_EVENT_KEYS.runDetails.tabs['overview'].tabView,
    );
  }, []);

  return (
    <section className='RunOverviewTab'>
      <div className='RunOverviewTab__content'>
        <CLIArgumentsCard
          cliArguments={getValue(
            props.runData,
            ['runParams', '__system_params', 'arguments'],
            null,
          )}
          isRunInfoLoading={props.runData?.isRunInfoLoading}
        />
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
