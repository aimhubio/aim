import React, { memo, useEffect, useRef, useState } from 'react';
import hexToRgbA from 'utils/haxToRgba';
import { Button } from '@material-ui/core';

import Table from 'components/Table/Table';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CreateIcon from '@material-ui/icons/Create';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { ITagProps, ITagsTableProps } from 'types/pages/tags/Tags';
import tagsAppModel from 'services/models/tags/tagsAppModel';

function TagsTable({
  tableRef,
  tagsList,
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
        return (
          <div key={i} className='TagContainer__tagBox'>
            <div
              className='TagContainer__tagBox__tag'
              style={{
                borderColor: color,
                background: hexToRgbA(color, 0.1),
              }}
            >
              <span
                className='TagContainer__tagBox__tag__content'
                style={{ color }}
              >
                {name}
              </span>
            </div>
          </div>
        );
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
                  <CreateIcon
                    color='primary'
                    className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                    onClick={() => onUpdateClick(cellData)}
                  />
                )}
                {cellData?.archived ? (
                  <VisibilityIcon
                    color='primary'
                    className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                    onClick={() => onSoftDeleteClick(cellData)}
                  />
                ) : (
                  <VisibilityOffIcon
                    color='primary'
                    className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                    onClick={() => onSoftDeleteClick(cellData)}
                  />
                )}
                <DeleteOutlineIcon
                  fontSize='small'
                  color='primary'
                  className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
                  onClick={() => onDeleteClick(cellData)}
                />
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
    <div className='TagsTable'>
      <Table
        ref={tableRef}
        fixed={false}
        columns={tableColumns}
        data={[]}
        hideHeaderActions
        rowHeight={52}
        headerHeight={32}
        onRowHover={(rowIndex) => setHoveredRowIndex(rowIndex)}
        onRowClick={(rowIndex) => onTableRunClick(rowIndex || '')}
        emptyText={'No tags found'}
      />
    </div>
  );
}

export default memo(TagsTable);
