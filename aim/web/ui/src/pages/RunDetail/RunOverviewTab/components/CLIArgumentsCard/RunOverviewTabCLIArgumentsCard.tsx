import React from 'react';

import { Text } from 'components/kit';
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
        <div className='CLIArguments'>
          <Text
            weight={600}
            size={18}
            tint={100}
            component='p'
            className='CLIArguments__title'
          >
            CLI Arguments
          </Text>
          <CodeBlock code={code} />
        </div>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunOverviewTabCLIArgumentsCard.displayName = 'RunOverviewTabCLIArgumentsCard';

export default React.memo<IRunOverviewTabCLIArgumentsCardProps>(
  RunOverviewTabCLIArgumentsCard,
);
