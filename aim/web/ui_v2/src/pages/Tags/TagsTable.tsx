import React, { memo, useEffect, useRef, useState } from 'react';
import { isNil } from 'lodash-es';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CreateIcon from '@material-ui/icons/Create';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import hexToRgbA from 'utils/haxToRgba';
import Button from 'components/Button/Button';
import Table from 'components/Table/Table';
import tagsAppModel from 'services/models/tags/tagsAppModel';
import TagLabel from 'components/TagLabel/TagLabel';
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
        return <TagLabel name={name} color={color} key={i} />;
      },
    },
    {
      dataKey: 'runs',
      key: 'runs',
      title: 'Runs',
      width: 150,
      cellRenderer: function cellRenderer({ cellData }: any, i: any) {
        return (
          <Button className='TagsTable__runContainer__runBox'>
            <div className='TagsTable__runContainer__runBox'>
              <span className='TagsTable__runContainer__runBox__runIconBox'>
                <span className='TagsTable__runContainer__runBox__runIconBox__runIcon'></span>
              </span>
              <span className='TagsTable__runContainer__runBox__runText'>
                {cellData.count} Runs
              </span>
            </div>
          </Button>
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
            className='TagsTable__commentContainer'
            role='button'
            aria-pressed='false'
            onClick={(e) => e.stopPropagation()}
          >
            <span>{cellData.description}</span>
            {cellData.id === hoveredRowIndex && (
              <div className='TagsTable__commentContainer__actionsContainer'>
                {!cellData?.archived && (
                  <span className='TagDetail__headerContainer__headerActionsBox__actionsIcon__Wrapper '>
                    <CreateIcon
                      color='primary'
                      className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                      onClick={() => onUpdateClick(cellData)}
                    />
                  </span>
                )}
                {cellData?.archived ? (
                  <span className='TagDetail__headerContainer__headerActionsBox__actionsIcon__Wrapper '>
                    <VisibilityIcon
                      color='primary'
                      className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                      onClick={() => onSoftDeleteClick(cellData)}
                    />
                  </span>
                ) : (
                  <span className='TagDetail__headerContainer__headerActionsBox__actionsIcon__Wrapper '>
                    <VisibilityOffIcon
                      color='primary'
                      className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                      onClick={() => onSoftDeleteClick(cellData)}
                    />
                  </span>
                )}
                <span className='TagDetail__headerContainer__headerActionsBox__actionsIcon__Wrapper '>
                  <DeleteOutlineIcon
                    fontSize='small'
                    color='primary'
                    className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                    onClick={() => onDeleteClick(cellData)}
                  />
                </span>
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
    tableRef.current?.updateData({
      newData: tagsList.map((tagData: ITagProps, i: number) => ({
        key: tagData.id,
        name: { name: tagData.name, color: tagData.color },
        comment: tagData,
        runs: { count: tagData.run_count, tagId: tagData.id },
      })),
      newColumns: tableColumns,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsList, onTableRunClick, hoveredRowIndex]);

  return (
    <div className='Tags__TagList__tagListBox'>
      {!isTagsDataLoading && !isNil(tagsList) && (
        <div className='Tags__TagList__tagListBox__titleBox'>
          <span className='Tags__TagList__tagListBox__titleBox__title'>
            {tagsList.length} {tagsList.length > 1 ? 'Tags' : 'Tag'}
          </span>
        </div>
      )}
      <div className='TagsTable'>
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
          emptyText={hasSearchValue ? 'No tags found' : 'No tags'}
        />
      </div>
    </div>
  );
}

export default memo(TagsTable);
