import React from 'react';

import { Card } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import CodeBlock from 'components/CodeBlock/CodeBlock';

import { IRunOverviewTabCLIArgumentsCardProps } from './RunOverviewTabCLIArgumentsCard.d';

import './RunOverviewTabCLIArgumentsCard.scss';

function RunOverviewTabCLIArgumentsCard({
  cliArguments,
  isRunInfoLoading,
}: IRunOverviewTabCLIArgumentsCardProps) {
  const code: string = React.useMemo(
    () => (cliArguments || []).join(' '),
    [cliArguments],
  );
  return (
    <ErrorBoundary>
      <BusyLoaderWrapper isLoading={isRunInfoLoading} height='100%'>
        <Card
          title='CLI Arguments'
          className='RunOverviewTabCLIArgumentsCard RunOverviewTab__cardBox'
        >
          <CodeBlock code={code} />
        </Card>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunOverviewTabCLIArgumentsCard.displayName = 'RunOverviewTabCLIArgumentsCard';

export default React.memo<IRunOverviewTabCLIArgumentsCardProps>(
  RunOverviewTabCLIArgumentsCard,
);
