import React from 'react';

import RunOverviewSidebar from './RunOverviewSidebar/RunOverviewSidebar';

import './RunOverViewTab.scss';

function RunOverviewTab(props: any) {
  return (
    <div>
      <h1>Run Overview</h1>
      <RunOverviewSidebar
        systemBatchLength={props.runData?.runSystemBatch?.length}
        info={props.runData.runInfo}
        traces={props.runData.runTraces}
      />
    </div>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
