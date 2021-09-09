import React from 'react';
import { size } from 'lodash-es';
import Table from 'components/Table/Table';
import { IRunsTableProps } from 'types/pages/runs/Runs';
import runAppModel from 'services/models/runs/runsAppModel';
import runsAppModel from 'services/models/runs/runsAppModel';

function RunsTable({
  isRunsDataLoading,
  runsList,
  tableRef,
  columns,
  tableRowHeight,
  onExportTableData,
  getLastRunsData,
}: IRunsTableProps): React.FunctionComponentElement<React.ReactNode> {
  const getLatestRunsDataRequestRef = React.useRef<any>(null);
  React.useEffect(() => {
    return () => {
      getLatestRunsDataRequestRef.current?.abort();
    };
  }, []);

  function handleInfiniteLoad(row: any) {
    getLatestRunsDataRequestRef.current = getLastRunsData(row);
    getLatestRunsDataRequestRef.current.call();
  }

  return (
    <div className='Runs__RunList__runListBox'>
      <div className='Runs__RunList__runListBox__titleBox'>
        <span className='Runs__RunList__runListBox__titleBox__title'>Runs</span>
      </div>
      <div className='RunsTable'>
        <Table
          custom
          isInfiniteLoading
          showRowClickBehaviour={false}
          infiniteLoadHandler={handleInfiniteLoad}
          emptyText={'No runs found'}
          key={`${columns?.length}-${size(runsList)}`}
          ref={tableRef}
          data={null}
          columns={columns}
          isLoading={isRunsDataLoading}
          // Table options
          topHeader
          groups={!Array.isArray(runsList)}
          rowHeight={tableRowHeight}
          // Table actions
          onSort={() => null}
          onManageColumns={() => null}
          onExport={onExportTableData}
          onRowsChange={() => null}
          onRowHover={() => null}
        />
      </div>
    </div>
  );
}

export default RunsTable;
