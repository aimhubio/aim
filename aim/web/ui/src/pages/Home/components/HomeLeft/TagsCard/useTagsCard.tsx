import React from 'react';
import _ from 'lodash-es';

import { IExperimentData } from 'modules/core/api/experimentsApi';
import { IResourceState } from 'modules/core/utils/createResource';
import { Checkbox } from '@material-ui/core';

import { Badge, Icon, Text } from 'components/kit';

import createTagsEngine from './TagsStore';

function useTagsCard() {
  const tableRef = React.useRef<any>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const { current: tagsEngine } = React.useRef(createTagsEngine);
  const tagsStore: IResourceState<IExperimentData> = tagsEngine.tagsState(
    (state) => state,
  );

  React.useEffect(() => {
    tagsEngine.fetchTags();
    return () => {
      tagsEngine.tagsState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // memoized table data
  const tableData = React.useMemo(() => {
    if (tagsStore.data) {
      return tagsStore.data.map(
        ({ name, archived, run_count, color }: any, index: number) => {
          return {
            key: name,
            name: { name, color },
            archived,
            run_count,
            id: name,
          };
        },
      );
    }
    return [];
  }, [tagsStore.data]);

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
            Name
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
        cellRenderer: ({ cellData }: any) => (
          <Badge
            size='xSmall'
            title={cellData.name}
            label={cellData.name}
            color={cellData.color}
          />
        ),
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

  // Update the table data and columns when the tags data changes
  React.useEffect(() => {
    if (tableRef.current?.updateData) {
      tableRef.current.updateData({
        newColumns: tableColumns,
        newData: tableData,
      });
    }
  }, [tableData, tableColumns]);

  const tagsQuery = React.useMemo(() => {
    return `any([t in [${_.uniq(selectedRows)
      .map((val: string) => `"${val}"`)
      .join(',')}] for t in run.tags])`;
  }, [selectedRows]);

  return {
    tableRef,
    tableColumns,
    tableData,
    tagsStore,
    selectedRows,
    tagsQuery,
  };
}
export default useTagsCard;
