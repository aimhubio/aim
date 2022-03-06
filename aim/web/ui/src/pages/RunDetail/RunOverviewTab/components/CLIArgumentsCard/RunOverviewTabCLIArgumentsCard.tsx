import React from 'react';

import { Card, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import { ICardProps } from 'components/kit/Card/Card.d';

import { IRunOverviewTabCLIArgumentsCardProps } from './RunOverviewTabCLIArgumentsCard.d';

function RunOverviewTabCLIArgumentsCard({
  cliArguments,
  isRunInfoLoading,
}: IRunOverviewTabCLIArgumentsCardProps) {
  const tableData = React.useMemo(
    () =>
      (cliArguments || []).map((argument, index) => {
        const [key = '', value = ''] = (argument || '').split('=');
        return {
          key: index,
          name: key,
          value: value,
        };
      }),
    [cliArguments],
  );
  const dataListProps = React.useMemo(
    (): ICardProps['dataListProps'] => ({
      tableColumns: [
        {
          dataKey: 'name',
          key: 'name',
          width: '50%',
          title: (
            <Text weight={600} size={14} tint={100}>
              CLI Arguments
              <Text
                weight={600}
                size={14}
                tint={50}
                className='RunOverviewTab__cardBox__tableTitleCount'
              >
                ({tableData.length})
              </Text>
            </Text>
          ),
          cellRenderer: ({ cellData }: any) => (
            <p title={cellData}>{cellData}</p>
          ),
        },
        {
          dataKey: 'value',
          key: 'value',
          width: '50%',
          title: 'Value',
          cellRenderer: ({ cellData }: any) => (
            <p title={cellData}>{cellData}</p>
          ),
        },
      ],
      tableData,
      illustrationConfig: {
        size: 'large',
        title: 'No Results',
      },
    }),
    [tableData],
  );
  return (
    <ErrorBoundary>
      <BusyLoaderWrapper isLoading={isRunInfoLoading} height='100%'>
        <Card
          title='CLI Arguments'
          className='RunOverviewTab__cardBox'
          dataListProps={dataListProps}
        />
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunOverviewTabCLIArgumentsCard.displayName = 'RunOverviewTabCLIArgumentsCard';

export default React.memo<IRunOverviewTabCLIArgumentsCardProps>(
  RunOverviewTabCLIArgumentsCard,
);
