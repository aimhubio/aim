import React, { memo, useEffect, useRef } from 'react';
import hexToRgbA from 'utils/haxToRgba';
import { Button } from '@material-ui/core';

import Table from 'components/Table/Table';
import { ITagsTableProps } from 'types/pages/tags/Tags';

function TagsTable({
  tagsList,
  onTableRunClick,
}: ITagsTableProps): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = useRef<any>({});
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
          <Button
            className='TagsTable__runContainer__runBox'
            onClick={(e) => onTableRunClick(e, cellData.tagId)}
          >
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
      cellRenderer: function cellRenderer({ cellData }: any, i: any) {
        return <p>{cellData}</p>;
      },
    },
    {
      dataKey: 'actions',
      key: 'actions',
      title: '',
      width: 50,
      flexGrow: 0,
      frozen: 'right',
      cellRenderer: function cellRenderer({ cellData }: any, i: any) {
        return <p>fff</p>;
      },
    },
  ];

  useEffect(() => {
    tableRef.current?.updateData({
      newData: tagsList.map((tagData: any) => ({
        name: { name: tagData.name, color: tagData.color },
        comment: tagData.name,
        runs: { count: tagData.run_count, tagId: tagData.id },
      })),
      newColumns: tableColumns,
    });
  }, [tagsList, onTableRunClick]);

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
      />
    </div>
  );
}

export default memo(TagsTable);
