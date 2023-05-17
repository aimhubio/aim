import React, { memo, useEffect, useState } from 'react';
import _ from 'lodash-es';

import Table from 'components/Table/Table';
import { Badge, Button, Icon, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

import tagsAppModel from 'services/models/tags/tagsAppModel';

import { ITagProps, ITagsTableProps } from 'types/pages/tags/Tags';

function TagsTable({
  tableRef,
  tagsList,
  hasSearchValue,
  isTagsDataLoading,
  onTableRunClick,
  onSoftDeleteModalToggle,
  onUpdateModalToggle,
  onDeleteModalToggle,
}: ITagsTableProps): React.FunctionComponentElement<React.ReactNode> {
  const [hoveredRowIndex, setHoveredRowIndex] = useState('');
  const tableColumns = [
    {
      dataKey: 'name',
      key: 'name',
      title: 'Name & Color',
      width: 200,
      cellRenderer: function cellRenderer({ cellData }: any, i: any) {
        const { name, color } = cellData;
        return <Badge label={name} color={color} key={i} maxWidth='100%' />;
      },
    },
    {
      dataKey: 'runs',
      key: 'runs',
      title: 'Runs',
      width: 150,
      cellRenderer: function cellRenderer({ cellData }: any, i: any) {
        return (
          <div className='TagsTable__runsCell'>
            <span className='TagsTable__runsCell--iconBox'>
              <Icon name='circle-with-dot' />
            </span>
            <Text size={14} color='info'>
              {cellData.count}
            </Text>
          </div>
        );
      },
    },
    {
      dataKey: 'comment',
      key: 'comment',
      title: 'Comment',
      width: 0,
      flexGrow: 1,
      cellRenderer: function cellRenderer({ cellData, i }: any) {
        return (
          <div
            className='TagsTable__commentCell'
            role='button'
            aria-pressed='false'
            onClick={(e) => e.stopPropagation()}
          >
            <Text size={14} tint={100}>
              {cellData.description}
            </Text>
            {cellData.id === hoveredRowIndex && (
              <div className='TagsTable__commentCell__actionsContainer'>
                {!cellData?.archived && (
                  <Button
                    withOnlyIcon={true}
                    onClick={() => onUpdateClick(cellData)}
                  >
                    <Icon color='primary' name='edit' />
                  </Button>
                )}
                {cellData?.archived ? (
                  <Button
                    withOnlyIcon={true}
                    onClick={() => onSoftDeleteClick(cellData)}
                  >
                    <Icon color='primary' name='eye-show-outline' />
                  </Button>
                ) : (
                  <Button
                    withOnlyIcon={true}
                    onClick={() => onSoftDeleteClick(cellData)}
                  >
                    <Icon color='primary' name='eye-outline-hide' />
                  </Button>
                )}
                <Button
                  onClick={() => onDeleteClick(cellData)}
                  withOnlyIcon={true}
                >
                  <Icon fontSize='small' name='delete' color='primary' />
                </Button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  function onSoftDeleteClick(tagData: ITagProps) {
    tagsAppModel.updateTagInfo(tagData);
    onSoftDeleteModalToggle();
  }

  function onUpdateClick(tagData: ITagProps) {
    tagsAppModel.updateTagInfo(tagData);
    onUpdateModalToggle();
  }

  function onDeleteClick(tagData: ITagProps) {
    tagsAppModel.updateTagInfo(tagData);
    onDeleteModalToggle();
  }

  useEffect(() => {
    if (tableRef.current.updateData) {
      tableRef?.current?.updateData({
        newData: tagsList.map((tagData: ITagProps, i: number) => ({
          key: tagData.id,
          name: { name: tagData.name, color: tagData.color },
          comment: tagData,
          runs: { count: tagData.run_count, tagId: tagData.id },
        })),
        newColumns: tableColumns,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsList, onTableRunClick, hoveredRowIndex]);

  return (
    <ErrorBoundary>
      <div className='Tags__TagList__tagListBox'>
        <div className='Tags__TagList__tagListBox__titleBox'>
          {!isTagsDataLoading && !_.isNil(tagsList) && (
            <Text component='h4' size={14} weight={600} tint={100}>
              {tagsList.length} {tagsList.length > 1 ? 'Tags' : 'Tag'}
            </Text>
          )}
        </div>

        <Table
          ref={tableRef}
          fixed={false}
          columns={tableColumns}
          data={null}
          isLoading={isTagsDataLoading}
          hideHeaderActions
          rowHeight={52}
          headerHeight={32}
          onRowHover={(rowIndex) => setHoveredRowIndex(rowIndex)}
          onRowClick={(rowIndex) => onTableRunClick(rowIndex || '')}
          illustrationConfig={{
            type: hasSearchValue
              ? IllustrationsEnum.EmptySearch
              : IllustrationsEnum.ExploreData,
            page: 'tags',
          }}
          height='calc(100% - 39px)'
        />
      </div>
    </ErrorBoundary>
  );
}

export default memo(TagsTable);
