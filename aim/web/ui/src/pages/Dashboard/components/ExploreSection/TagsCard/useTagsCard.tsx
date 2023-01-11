import React from 'react';
import _ from 'lodash-es';

import { Checkbox } from '@material-ui/core';

import { Badge, Icon, Text } from 'components/kit';

import { IResourceState } from 'modules/core/utils/createResource';
import { ITagData } from 'modules/core/api/tagsApi/types';

import createTagsEngine from './TagsStore';

function useTagsCard() {
  const tableRef = React.useRef<any>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const { current: tagsEngine } = React.useRef(createTagsEngine);
  const tagsStore: IResourceState<ITagData[]> = tagsEngine.tagsState(
    (state) => state,
  );

  React.useEffect(() => {
    tagsEngine.fetchTags();
    return () => {
      tagsEngine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // memoized table data
  const tableData = React.useMemo(() => {
    if (tagsStore.data) {
      return tagsStore.data.map(
        ({ name, archived, run_count, color }: ITagData) => {
          return {
            key: name,
            name,
            color,
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
                  <Icon name='check' fontSize={8} />
                </span>
              ) : (
                <span className='partiallySelectedSelectIcon'>
                  <Icon name='partially-selected' fontSize={12} />
                </span>
              )
            }
            onClick={() => onRowSelect()}
            checked={!!selectedRows.length}
          />
        ),
        width: '20px',
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
                  <Icon name='check' fontSize={8} />
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
          <Text weight={600} size={12} tint={100}>
            Name
          </Text>
        ),
        width: 'calc(100% - 50px)',
        style: { paddingLeft: 10, paddingRight: 12 },
        cellRenderer: ({ cellData, rowData: { color } }: any) => (
          <Badge label={cellData} color={color} size='xSmall' />
        ),
      },
      {
        dataKey: 'run_count',
        key: 'run_count',
        title: (
          <Text weight={600} size={12} tint={100}>
            Runs
          </Text>
        ),
        flexGrow: 1,
        style: { textAlign: 'right' },
        width: '46px',
        cellRenderer: ({ cellData }: any) => (
          <Text
            style={{ textAlign: 'right', width: '100%', paddingRight: 12 }}
            component='p'
            size={12}
            tint={100}
            title={cellData}
          >
            {cellData}
          </Text>
        ),
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
