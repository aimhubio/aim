import React from 'react';
import _ from 'lodash';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/kit/Card/Card';
import { Badge } from 'components/kit';

import COLORS from 'config/colors/colors';

import runDetailAppModel from 'services/models/runs/runDetailAppModel';

import contextToString from 'utils/contextToString';

function RunOverviewTabMetricsCard({
  runData,
  runHash,
  runBatch,
  type,
}: {
  runData: any;
  runBatch: any;
  type: 'metric' | 'systemMetric';
  runHash: string;
}) {
  const [tableData, setTableData]: any = React.useState([]);

  React.useEffect(() => {
    if (!runBatch && !_.isNil(runData.runTraces)) {
      const runsBatchRequestRef = runDetailAppModel.getRunMetricsBatch(
        runData.runTraces.metric,
        runHash,
      );
      runsBatchRequestRef.call();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runData.runTraces, runHash]);

  React.useEffect(() => {
    if (runBatch) {
      const resultTableList = runBatch.map(
        ({ name, values, context }: any, index: number) => {
          return {
            key: index,
            name: name,
            value: `${_.last(values)}`,
            context: context,
          };
        },
      );
      setTableData(resultTableList);
    }
  }, [runBatch]);

  const tableColumns = React.useMemo(
    () => [
      {
        dataKey: 'name',
        key: 'name',
        title: `Name (${runBatch?.length})`,
        width: '33.3%',
        cellRenderer: function cellRenderer({ cellData }: any) {
          return <p>{cellData}</p>;
        },
      },
      {
        dataKey: 'context',
        key: 'context',
        title: 'Context',
        width: '33.3%',
        cellRenderer: function cellRenderer({ cellData }: any) {
          return !_.isEmpty(cellData) && !_.isNil(cellData) ? (
            <Badge
              size='small'
              color={COLORS[0][0]}
              label={contextToString(cellData) || ''}
              className='RunOverviewTab__cardBox__badge'
            />
          ) : (
            <Badge
              size='small'
              color={'#F8FAFD'}
              label={'Empty Context'}
              className='RunOverviewTab__cardBox__badge emptyContext'
            />
          );
        },
      },
      {
        dataKey: 'value',
        key: 'value',
        title: 'Last Value',
        width: '33.3%',
        cellRenderer: function cellRenderer({ cellData }: any) {
          return <p>{cellData}</p>;
        },
      },
    ],
    [runBatch],
  );

  return (
    <ErrorBoundary>
      <Card
        title={type === 'metric' ? 'Metrics' : 'System Metrics'}
        subtitle={
          type === 'metric'
            ? 'Little information about Metrics'
            : 'Little information about System Metrics'
        }
        className='RunOverviewTab__cardBox'
        dataListProps={{
          isLoading: runData?.isRunBatchLoading || !runBatch,
          searchableKeys: ['name', 'value'],
          tableColumns,
          tableData,
          illustrationConfig: {
            size: 'large',
            title: 'No Results',
          },
        }}
      />
    </ErrorBoundary>
  );
}

RunOverviewTabMetricsCard.displayName = 'RunOverviewTabMetricsCard';

export default React.memo(RunOverviewTabMetricsCard);
