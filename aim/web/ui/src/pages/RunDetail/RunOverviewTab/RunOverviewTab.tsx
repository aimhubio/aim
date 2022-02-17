import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/Card/Card';

import './RunOverViewTab.scss';

function RunOverviewTab() {
  return (
    <ErrorBoundary>
      <div className='RunOverviewTab'>
        <Card
          name='Params'
          title='Little information about Params'
          className='RunOverviewTab__cardBox'
        />
        <Card
          name='Params'
          title='Little information about Params'
          className='RunOverviewTab__cardBox'
        >
          <div>asfasfsa</div>
        </Card>
        <Card name='Params'>
          <div>asfasfsa</div>
        </Card>
      </div>
    </ErrorBoundary>
  );
}

RunOverviewTab.displayName = 'RunOverviewTab';

export default React.memo(RunOverviewTab);
