import React from 'react';

import { Checkbox } from '@material-ui/core';

import DataList from 'components/kit/DataList';
import { Card, Icon, Text } from 'components/kit';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import { IExperimentCardProps } from './ExperimentsCard.d';

import './ExperimentsCard.scss';

function ExperimentsCard(props: IExperimentCardProps) {
  const tableRef = React.useRef<any>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  // memoized table data
  const tableData = React.useMemo(() => {
    if (props.experimentsData) {
      return props.experimentsData.map(
        ({ name, archived, run_count }: any, index: number) => {
          return {
            key: index,
            name: name,
            archived,
            run_count,
            id: name,
          };
        },
      );
    }
    return [];
  }, [props.experimentsData]);

  // on row selection
  const onRowSelect = React.useCallback(
    (rowKey?: string) => {
      if (rowKey) {
        const newSelectedRows = selectedRows.includes(rowKey)
          ? selectedRows.filter((row: string) => row !== rowKey)
          : [...selectedRows, rowKey];
        setSelectedRows(newSelectedRows);
      } else if (selectedRows.length) {
        setSelectedRows([]);
      } else {
        setSelectedRows(tableData.map(({ name }: any) => name));
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
            icon={<span className='defaultSelectIcon'></span>}
            className='selectCheckbox'
            checkedIcon={
              tableData.length === Object.keys(selectedRows)?.length ? (
                <span className='selectedSelectIcon'>
                  <Icon name='check' fontSize={9} />
                </span>
              ) : (
                <span className='partiallySelectedSelectIcon'>
                  <Icon name='partially-selected' fontSize={16} />
                </span>
              )
            }
            onClick={() => onRowSelect()}
            checked={!!selectedRows.length}
          />
        ),
        width: '70px',
        cellRenderer: ({ cellData }: any) => {
          return (
            <Checkbox
              color='primary'
              size='small'
              icon={<span className='defaultSelectIcon'></span>}
              className='selectCheckbox'
              checked={selectedRows.includes(cellData)}
              checkedIcon={
                <span className='selectedSelectIcon'>
                  <Icon name='check' fontSize={9} />
                </span>
              }
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
          height='400px'
          searchableKeys={['name', 'run_count']}
          illustrationConfig={{
            size: 'large',
            title: 'No Results',
          }}
          toolbarItems={[
            <CompareSelectedRunsPopover
              key='compareSelectedRunsPopover'
              appName={'home' as AppNameEnum}
              selectedRows={selectedRows}
              keyName='experiment'
              disabled={!selectedRows.length}
            />,
          ]}
        />
      </Card>
    </div>
  );
}

ExperimentsCard.displayName = 'ExperimentsCard';

export default React.memo(ExperimentsCard);
