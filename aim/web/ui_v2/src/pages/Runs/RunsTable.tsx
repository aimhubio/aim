import React from 'react';
import { isNil, size } from 'lodash-es';
import Table from 'components/Table/Table';
import { IRunsTableProps } from 'types/pages/runs/Runs';

function RunsTable({
  isRunsDataLoading,
  runsList,
  tableRef,
}: IRunsTableProps): React.FunctionComponentElement<React.ReactNode> {
  const tableColumns: any = [];
  React.useEffect(() => {
    tableRef.current?.updateData({
      newData: runsList?.map((i: number) => ({})),
      newColumns: tableColumns,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runsList]);
  console.log(runsList);
  return (
    <div className='Runs__RunList__runListBox'>
      <div className='Runs__RunList__runListBox__titleBox'>
        <span className='Runs__RunList__runListBox__titleBox__title'>Runs</span>
      </div>
      <div className='RunsTable'>
        <Table
          custom
          ref={tableRef}
          fixed={false}
          columns={tableColumns}
          data={null}
          isLoading={isRunsDataLoading}
          hideHeaderActions
          rowHeight={52}
          headerHeight={32}
          onRowHover={() => null}
          onRowClick={() => null}
          emptyText={'No runs'}
        />
      </div>
    </div>
  );
}

export default RunsTable;
