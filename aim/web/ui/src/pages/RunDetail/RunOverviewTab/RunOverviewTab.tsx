import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import TableCard from 'components/TableCard/TableCard';

import './RunOverViewTab.scss';

function RunOverviewTab() {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'>
        <TableCard
          name='Params'
          title='Little information about Params'
          className='RunOverviewTab__cardBox'
        />
        <TableCard
          name='Params'
          title='Little information about Params'
          className='RunOverviewTab__cardBox'
        >
          <div>asfasfsa</div>
        </TableCard>
        <TableCard name='Params'>
          <div>asfasfsa</div>
        </TableCard>
      </div>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
