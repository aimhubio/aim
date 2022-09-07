import React from 'react';

import { IExperimentData } from 'modules/core/api/experimentsApi';
import { IResourceState } from 'modules/core/utils/createResource';
import { Checkbox } from '@material-ui/core';

import { Icon, Text } from 'components/kit';

import createExperimentEngine from './ExperimentsStore';

function useExperimentsCard() {
  const tableRef = React.useRef<any>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const { current: experimentsEngine } = React.useRef(createExperimentEngine);
  const experimentsStore: IResourceState<IExperimentData> =
    experimentsEngine.experimentsState((state) => state);

  React.useEffect(() => {
    experimentsEngine.fetchExperiments();
    return () => {
      experimentsEngine.experimentsState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // memoized table data
  const tableData: {
    key: number;
    name: string;
    archived: boolean;
    run_count: number;
    id: string;
  }[] = React.useMemo(() => {
    if (experimentsStore.data) {
      return experimentsStore.data.map(
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
  }, [experimentsStore.data]);

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
        width: '65px',
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
        width: 'calc(100% - 135px)',
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
      },
      {
        dataKey: 'run_count',
        key: 'run_count',
        title: 'Runs',
        flexGrow: 1,
        width: '70px',
        cellRenderer: ({ cellData }: any) => <p title={cellData}>{cellData}</p>,
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
  return { tableRef, tableColumns, tableData, experimentsStore, selectedRows };
}
export default useExperimentsCard;
