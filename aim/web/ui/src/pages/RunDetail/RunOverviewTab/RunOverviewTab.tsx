import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import TableCard from 'components/TableCard/TableCard';

import './RunOverViewTab.scss';

function RunOverviewTab() {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'>
        <TableCard name='Params' title='Little information about Params' />
      </div>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
