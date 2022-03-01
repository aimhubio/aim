import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import RunOverviewTabParamsCard from './RunOverviewTabParamsCard';

import './RunOverViewTab.scss';

function RunOverviewTab({ runData }: any) {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'>
        <RunOverviewTabParamsCard runData={runData} />
      </div>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
