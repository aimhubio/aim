import React from 'react';
import { isNil, size, isEmpty } from 'lodash-es';
import Table from 'components/Table/Table';
import { IRunsTableProps } from 'types/pages/runs/Runs';

function RunsTable({
  isRunsDataLoading,
  runsList,
  tableRef,
  columns,
  tableRowHeight,
}: IRunsTableProps): React.FunctionComponentElement<React.ReactNode> {
  // React.useEffect(() => {
  //   tableRef.current?.updateData({
  //     newData: runsList?.map((i: number) => ({})),
  //     newColumns: columns,
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [runsList]);

  return (
    <div className='Runs__RunList__runListBox'>
      <div className='Runs__RunList__runListBox__titleBox'>
        <span className='Runs__RunList__runListBox__titleBox__title'>Runs</span>
      </div>
      <div className='RunsTable'>
        <Table
          custom
          emptyText={'No runs'}
          key={`${columns?.length}-${size(runsList)}`}
          ref={tableRef}
          data={[]}
          columns={columns}
          isLoading={isRunsDataLoading}
          // Table options
          topHeader
          groups={!Array.isArray(runsList)}
          rowHeight={tableRowHeight}
          // Table actions
          onSort={() => null}
          onExport={() => null}
          onManageColumns={() => null}
          onRowHeightChange={() => null}
          onRowsChange={() => null}
          onRowHover={() => null}
          onRowClick={() => null}
        />
      </div>
    </div>
  );
}

export default RunsTable;
