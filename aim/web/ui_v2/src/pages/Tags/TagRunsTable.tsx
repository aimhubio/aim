import React, { memo, useEffect, useRef } from 'react';
import Table from 'components/Table/Table';
import moment from 'moment';
import { NavLink } from 'react-router-dom';
import { ITagRun, ITagRunsTableProps } from 'types/pages/tags/Tags';

function TagRunsTable({
  runList,
}: ITagRunsTableProps): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = useRef<any>({});
  const tableColumns = [
    {
      dataKey: 'runs',
      key: 'runs',
      title: 'Runs',
      width: 400,
      cellRenderer: function cellRenderer({
        cellData,
      }: {
        cellData: { name: string; id: string };
      }) {
        return (
          <NavLink to={`/runs/${cellData.id}`}>
            <p className='TagsTable__runName'>{cellData.name}</p>
          </NavLink>
        );
      },
    },
    {
      dataKey: 'createdDate',
      key: 'createdDate',
      title: 'Created at',
      width: 400,
      cellRenderer: function cellRenderer({ cellData }: { cellData: string }) {
        return <p className='TagsTable__runCreatedDate'>{cellData}</p>;
      },
    },
  ];

  useEffect(() => {
    tableRef.current?.updateData({
      newData: runList.map((run: ITagRun) => ({
        runs: { name: run.experiment, id: run.run_id },
        createdDate: moment(run.creation_time).format('DD-MM-YY HH:mm'),
      })),
      newColumns: tableColumns,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runList]);

  return (
    <div className='TagsTable'>
      <Table
        ref={tableRef}
        fixed={false}
        columns={tableColumns}
        data={[]}
        hideHeaderActions
        rowHeight={32}
        headerHeight={32}
      />
    </div>
  );
}

export default memo(TagRunsTable);
