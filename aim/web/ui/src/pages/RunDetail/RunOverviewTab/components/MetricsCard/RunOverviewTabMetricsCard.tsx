import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import Card from 'components/kit/Card/Card';
import { Badge, Text } from 'components/kit';

import COLORS from 'config/colors/colors';

import contextToString from 'utils/contextToString';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { formatValue } from 'utils/formatValue';

function RunOverviewTabMetricsCard({
  isLoading,
  runBatch,
  type,
}: {
  isLoading: boolean;
  runBatch: any;
  type: 'metric' | 'systemMetric';
}) {
  const tableData = React.useMemo(() => {
    if (runBatch) {
      return runBatch.map(({ name, values, context }: any, index: number) => {
        return {
          key: index,
          name: isSystemMetric(name) ? formatSystemMetricName(name) : name,
          value: formatValue(_.last(values)),
          context: context,
        };
      });
    }
    return [];
  }, [runBatch]);

  const tableColumns = React.useMemo(
    () => [
      {
        dataKey: 'name',
        key: 'name',
        title: (
          <Text weight={600} size={14} tint={100}>
            Name
            <Text
              weight={500}
              size={14}
              tint={50}
              className='RunOverviewTab__cardBox__tableTitleCount'
            >
              ({runBatch?.length})
            </Text>
          </Text>
        ),
        width: '33.3%',
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
      },
      {
        dataKey: 'context',
        key: 'context',
        title: 'Context',
        width: '33.3%',
        cellRenderer: ({ cellData }: any) =>
          !_.isEmpty(cellData) && !_.isNil(cellData) ? (
            <Badge
              monospace
              size='small'
              color={COLORS[0][0]}
              label={contextToString(cellData) || ''}
              className='RunOverviewTab__cardBox__badge'
            />
          ) : (
            <Badge
              monospace
              size='small'
              color={'#F8FAFD'}
              label={'Empty Context'}
              className='RunOverviewTab__cardBox__badge emptyContext'
            />
          ),
      },
      {
        dataKey: 'value',
        key: 'value',
        title: 'Last Value',
        width: '33.3%',
        cellRenderer: ({ cellData }: any) => (
          <p className='tar' title={cellData}>
            {cellData}
          </p>
        ),
      },
    ],
    [runBatch],
  );

  return (
    <ErrorBoundary>
      <Card
        title={type === 'metric' ? 'Metrics' : 'System Metrics'}
        // subtitle={
        //   type === 'metric'
        //     ? 'Little information about Metrics'
        //     : 'Little information about System Metrics'
        // }
        className='RunOverviewTab__cardBox'
        dataListProps={{
          isLoading: isLoading || !runBatch,
          searchableKeys: ['name', 'value'],
          tableColumns,
          tableData,
          calcTableHeight: true,
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
