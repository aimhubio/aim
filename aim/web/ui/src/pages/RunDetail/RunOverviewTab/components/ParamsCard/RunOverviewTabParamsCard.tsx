import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/kit/Card/Card';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import { Text } from 'components/kit';

import getObjectPaths from 'utils/getObjectPaths';
import { formatValue } from 'utils/formatValue';
import { getValue } from 'utils/helper';

function RunOverviewTabParamsCard({ runParams, isRunInfoLoading }: any) {
  const tableData = React.useMemo(() => {
    const params = runParams.hasOwnProperty('__system_params')
      ? _.omit(runParams, '__system_params')
      : runParams;
    const paths = getObjectPaths(params, params);
    const resultTableList = paths.map((path, index) => {
      return {
        key: index,
        name: path,
        value: formatValue(getValue(params, path)),
      };
    });
    return resultTableList || [];
  }, [runParams]);

  const tableColumns = React.useMemo(
    () => [
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
              ({tableData.length})
            </Text>
          </Text>
        ),
        width: '50%',
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
      },
      {
        dataKey: 'value',
        key: 'value',
        title: 'Value',
        width: 0,
        flexGrow: 1,
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runParams, tableData],
  );

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={isRunInfoLoading || !runParams}
        className='RunDetailTabLoader'
        height='100%'
      >
        <Card
          title='Run Params'
          // subtitle='Little information about Params'
          className='RunOverviewTab__cardBox'
          dataListProps={{
            tableColumns,
            tableData,
            calcTableHeight: true,
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
