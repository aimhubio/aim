import React from 'react';
import _ from 'lodash-es';

import { Checkbox } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ExperimentNameBox from 'components/ExperimentNameBox';

import { IResourceState } from 'modules/core/utils/createResource';
import { IExperimentData } from 'modules/core/api/experimentsApi';

import createExperimentEngine from './ExperimentsStore';

import { ExperimentsCardRowDataType } from '.';

function useExperimentsCard() {
  const tableRef = React.useRef<any>(null);
  const [selectedRows, setSelectedRows] = React.useState<
    Record<string, ExperimentsCardRowDataType>
  >({});
  const { current: experimentsEngine } = React.useRef(createExperimentEngine);
  const experimentsStore: IResourceState<IExperimentData[]> =
    experimentsEngine.experimentsState((state) => state);

  React.useEffect(() => {
    experimentsEngine.fetchExperiments();
    return () => {
      experimentsEngine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // memoized table data
  const tableData: ExperimentsCardRowDataType[] = React.useMemo(() => {
    if (experimentsStore.data) {
      return experimentsStore.data.map(
        ({ name, archived, run_count, id }: IExperimentData, index: number) => {
          return {
            key: index,
            name,
            archived,
            run_count,
            id,
          };
        },
      );
    }
    return [];
  }, [experimentsStore.data]);

  // on row selection
  const onRowSelect = React.useCallback(
    (rowKey?: string, rowData?: ExperimentsCardRowDataType) => {
      if (rowKey) {
        const newSelectedRows = selectedRows[rowKey]
          ? _.omit(selectedRows, rowKey)
          : { ...selectedRows, [rowKey]: rowData };
        setSelectedRows(newSelectedRows);
      } else if (!_.isEmpty(selectedRows)) {
        setSelectedRows({});
      } else {
        const newSelectedRows = tableData.reduce(
          (
            acc: Record<string, ExperimentsCardRowDataType>,
            rowData: ExperimentsCardRowDataType,
          ) => {
            acc[rowData.id] = rowData;
            return acc;
          },
          {},
        );
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
            icon={<span className='defaultSelectIcon'></span>}
            className='selectCheckbox'
            checkedIcon={
              tableData.length === Object.keys(selectedRows)?.length ? (
                <span className='selectedSelectIcon'>
                  <Icon name='check' fontSize={8} />
                </span>
              ) : (
                <span className='partiallySelectedSelectIcon'>
                  <Icon name='partially-selected' fontSize={12} />
                </span>
              )
            }
            onClick={() => onRowSelect()}
            checked={!_.isEmpty(selectedRows)}
          />
        ),
        width: '20px',
        cellRenderer: ({
          cellData,
          rowData,
        }: {
          cellData: string;
          rowData: ExperimentsCardRowDataType;
        }) => {
          return (
            <Checkbox
              color='primary'
              size='small'
              icon={<span className='defaultSelectIcon'></span>}
              className='selectCheckbox'
              checked={!!selectedRows[cellData]}
              checkedIcon={
                <span className='selectedSelectIcon'>
                  <Icon name='check' fontSize={8} />
                </span>
              }
              onClick={() => onRowSelect(cellData, rowData)}
            />
          );
        },
      },
      {
        dataKey: 'name',
        key: 'name',
        title: (
          <Text weight={600} size={12} tint={100}>
            Name
          </Text>
        ),
        width: 'calc(100% - 50px)',
        style: { paddingLeft: 10, paddingRight: 12 },
        cellRenderer: ({
          cellData,
          rowData,
        }: {
          cellData: string;
          rowData: ExperimentsCardRowDataType;
        }) => (
          <ExperimentNameBox
            experimentName={cellData || ''}
            experimentId={rowData.id || ''}
          />
        ),
      },
      {
        dataKey: 'run_count',
        key: 'run_count',
        title: (
          <Text style={{ paddingRight: 12 }} weight={600} size={12} tint={100}>
            Runs
          </Text>
        ),
        flexGrow: 1,
        width: '46px',
        textAlign: 'right',
        style: { textAlign: 'right' },
        cellRenderer: ({ cellData }: { cellData: number }) => (
          <Text
            style={{ textAlign: 'right', width: '100%', paddingRight: 12 }}
            component='p'
            size={12}
            tint={100}
            title={`${cellData}`}
          >
            {cellData}
          </Text>
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

  const experimentsQuery = React.useMemo(() => {
    return `run.experiment in [${Object.values(selectedRows)
      .map(({ name }: ExperimentsCardRowDataType) => `"${name}"`)
      .join(',')}]`;
  }, [selectedRows]);

  return {
    tableRef,
    tableColumns,
    tableData,
    experimentsStore,
    selectedRows,
    experimentsQuery,
  };
}
export default useExperimentsCard;
