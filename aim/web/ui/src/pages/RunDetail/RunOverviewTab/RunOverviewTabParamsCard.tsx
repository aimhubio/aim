import React from 'react';
import _ from 'lodash';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/kit/Card/Card';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';

import getObjectPaths from 'utils/getObjectPaths';
import { formatValue } from 'utils/formatValue';

function RunOverviewTabParamsCard({ runData }: any) {
  const [tableData, setTableData]: any = React.useState([]);

  React.useEffect(() => {
    const paths = getObjectPaths(runData?.runParams, runData?.runParams);
    const resultTableList = paths.map((path, index) => {
      return {
        key: index,
        name: path,
        value: formatValue(_.get(runData?.runParams, path)),
      };
    });
    setTableData(resultTableList);
  }, [runData.runParams]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        isLoading={runData?.isRunInfoLoading || !runData?.runParams}
        className='runDetailParamsTabLoader'
        height='100%'
      >
        <Card
          title='Parameters'
          subtitle='Little information about Params'
          className='RunOverviewTab__cardBox'
          dataListProps={{
            tableColumns: [
              {
                dataKey: 'name',
                key: 'name',
                title: 'Name',
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
            ],
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
