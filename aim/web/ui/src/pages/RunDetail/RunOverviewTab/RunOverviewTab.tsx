import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/kit/Card/Card';

import './RunOverViewTab.scss';

function RunOverviewTab() {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'></div>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
