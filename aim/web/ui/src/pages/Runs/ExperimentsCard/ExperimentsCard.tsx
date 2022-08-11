import React from 'react';

import { Checkbox } from '@material-ui/core';

import DataList from 'components/kit/DataList';
import { Card, Text } from 'components/kit';

import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

import { IExperimentCardProps } from './ExperimentsCard.d';

function ExperimentsCard(props: IExperimentCardProps) {
  const tableRef = React.useRef<any>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  // memoized table data
  const tableData = React.useMemo(() => {
    if (props.experimentsData) {
      return props.experimentsData.map(
        ({ name, id, archived, run_count }: any, index: number) => {
          return {
            key: index,
            name: isSystemMetric(name) ? formatSystemMetricName(name) : name,
            archived,
            run_count,
            id,
          };
        },
      );
    }
    return [];
  }, [props.experimentsData]);

  // on row selection
  const onRowSelect = React.useCallback(
    (rowKey: string) => {
      if (rowKey === 'all') {
        setSelectedRows(
          selectedRows.length === tableData.length
            ? []
            : tableData.map(({ id }: any) => id),
        );
      } else {
        const newSelectedRows = selectedRows.includes(rowKey)
          ? selectedRows.filter((row: string) => row !== rowKey)
          : [...selectedRows, rowKey];
        setSelectedRows(newSelectedRows);
      }
    },
    [selectedRows, tableData],
  );

  // memoized table columns
  const tableColumns = React.useMemo(
    () => [
      {
        dataKey: 'id',
        key: 'id',
        title: (
          <Checkbox
            color='primary'
            size='small'
            // icon={<span className='Table__column__defaultSelectIcon'></span>}
            className='Table__column__selectCheckbox'
            onClick={() => onRowSelect('all')}
            checked={selectedRows.length === tableData.length}
          />
        ),
        width: '70px',
        cellRenderer: ({ cellData }: any) => {
          return (
            <Checkbox
              color='primary'
              size='small'
              // icon={<span className='Table__column__defaultSelectIcon'></span>}
              className='Table__column__selectCheckbox'
              checked={selectedRows.includes(cellData)}
              onClick={() => onRowSelect(cellData)}
            />
          );
        },
      },
      {
        dataKey: 'name',
        key: 'name',
        title: (
          <Text weight={600} size={14} tint={100}>
            Experiment
            <Text
              weight={600}
              size={14}
              tint={50}
              className='RunOverviewTab__cardBox__tableTitleCount'
            >
              ({tableData?.length})
            </Text>
          </Text>
        ),
        width: '45%',
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
      },
      {
        dataKey: 'run_count',
        key: 'run_count',
        title: 'Runs',
        flexGrow: 1,
        width: '15%',
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
      },
      {
        dataKey: 'archived',
        key: 'archived',
        title: 'Archived',
        width: '15%',
        flexGrow: 1,
        cellRenderer: ({ cellData }: any) => (
          <p title={cellData}>{`${cellData}`}</p>
        ),
      },
    ],
    [tableData?.length, onRowSelect, selectedRows],
  );

  // Update the table data and columns when the experiments data changes
  React.useEffect(() => {
    if (tableRef.current?.updateData) {
      tableRef.current.updateData({
        newColumns: tableColumns,
        newData: tableData,
      });
    }
  }, [tableData, tableColumns]);

  return (
    <div className='ExperimentsCard'>
      <Card title='Experiments'>
        <DataList
          tableRef={tableRef}
          tableColumns={tableColumns}
          tableData={tableData}
          isLoading={false}
          searchableKeys={['name', 'run_count']}
          illustrationConfig={{
            size: 'large',
            title: 'No Results',
          }}
        />
      </Card>
    </div>
  );
}

ExperimentsCard.displayName = 'ExperimentsCard';

export default React.memo(ExperimentsCard);
