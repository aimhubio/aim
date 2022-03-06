import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/kit/Card/Card';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import { Text } from 'components/kit';

import getObjectPaths from 'utils/getObjectPaths';
import { formatValue } from 'utils/formatValue';
import { getValue } from 'utils/helper';

function RunOverviewTabParamsCard({ runParams, isRunInfoLoading }: any) {
  const tableData = React.useMemo(() => {
    const paths = getObjectPaths(runParams, runParams).filter(
      (path) => !path.startsWith('__system_params'),
    );
    const resultTableList = paths.map((path, index) => {
      return {
        key: index,
        name: path,
        value: formatValue(getValue(runParams, path)),
      };
    });
    return resultTableList || [];
  }, [runParams]);

  const tableColumns = React.useMemo(() => {
    const paths = getObjectPaths(runParams, runParams);
    return [
      {
        dataKey: 'name',
        key: 'name',
        title: (
          <Text weight={600} size={14} tint={100}>
            Name
            <Text
              weight={600}
              size={14}
              tint={50}
              className='RunOverviewTab__cardBox__tableTitleCount'
            >
              ({paths?.length})
            </Text>
          </Text>
        ),
        width: '50%',
        cellRenderer: function cellRenderer({ cellData }: any) {
          return <p>{cellData}</p>;
        },
      },
      {
        dataKey: 'value',
        key: 'value',
        title: 'Value',
        width: '50%',
        cellRenderer: function cellRenderer({ cellData }: any) {
          return <p>{cellData}</p>;
        },
      },
    ];
  }, [runParams]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunInfoLoading || !runParams}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        <Card
          title='Parameters'
          // subtitle='Little information about Params'
          className='RunOverviewTab__cardBox'
          dataListProps={{
            tableColumns,
            tableData,
            illustrationConfig: {
              size: 'large',
              title: 'No Results',
            },
          }}
        />
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

RunOverviewTabParamsCard.displayName = 'RunOverviewTabParamsCard';

export default React.memo(RunOverviewTabParamsCard);
