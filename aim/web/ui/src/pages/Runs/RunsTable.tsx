import React from 'react';
import _ from 'lodash-es';

import { CircularProgress } from '@material-ui/core';

import Table from 'components/Table/Table';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import TableLoader from 'components/TableLoader/TableLoader';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import { RequestStatusEnum } from 'config/enums/requestStatusEnum';
import { Request_Illustrations } from 'config/illustrationConfig/illustrationConfig';

import { AppNameEnum } from 'services/models/explorer';

import { IRunsTableProps } from 'types/pages/runs/Runs';

function RunsTable({
  isInfiniteLoading,
  tableRef,
  columns,
  tableRowHeight,
  onExportTableData,
  getLastRunsData,
  isLatest,
  data,
  onColumnsVisibilityChange,
  onTableDiffShow,
  onManageColumns,
  onRowHeightChange,
  hiddenColumns,
  columnsOrder,
  columnsWidths,
  hideSystemMetrics,
  updateColumnsWidths,
  selectedRows,
  onRowSelect,
  archiveRuns,
  deleteRuns,
  requestStatus,
}: IRunsTableProps): React.FunctionComponentElement<React.ReactNode> {
  const getLatestRunsDataRequestRef = React.useRef<any>(null);
  React.useEffect(() => {
    return () => {
      getLatestRunsDataRequestRef.current?.abort();
    };
  }, []);

  function handleInfiniteLoad(row: any) {
    if (!isLatest && !isInfiniteLoading) {
      getLatestRunsDataRequestRef.current = getLastRunsData(row);
      getLatestRunsDataRequestRef.current?.call().catch();
    }
  }

  return (
    <ErrorBoundary>
      <div className='Runs__RunList__runListBox'>
        <div className='RunsTable'>
          <BusyLoaderWrapper
            height='100%'
            loaderComponent={<TableLoader />}
            isLoading={requestStatus === RequestStatusEnum.Pending}
          >
            {_.isEmpty(data) && requestStatus !== RequestStatusEnum.Pending ? (
              <IllustrationBlock
                size='xLarge'
                type={Request_Illustrations[requestStatus as RequestStatusEnum]}
              />
            ) : (
              <Table
                custom
                allowInfiniteLoading
                isInfiniteLoading={isInfiniteLoading}
                showRowClickBehaviour={false}
                infiniteLoadHandler={handleInfiniteLoad}
                showResizeContainerActionBar={false}
                emptyText={'No runs found'}
                ref={tableRef}
                data={data}
                columns={columns}
                isLoading={requestStatus === RequestStatusEnum.Pending}
                selectedRows={selectedRows}
                appName={AppNameEnum.RUNS}
                multiSelect
                // Table options
                topHeader
                rowHeight={tableRowHeight}
                hiddenColumns={hiddenColumns}
                hideSystemMetrics={hideSystemMetrics}
                columnsOrder={columnsOrder}
                columnsWidths={columnsWidths}
                // Table actions
                onManageColumns={onManageColumns}
                onColumnsVisibilityChange={onColumnsVisibilityChange}
                onTableDiffShow={onTableDiffShow}
                onRowHeightChange={onRowHeightChange}
                updateColumnsWidths={updateColumnsWidths}
                onExport={onExportTableData}
                onRowSelect={onRowSelect}
                archiveRuns={archiveRuns}
                deleteRuns={deleteRuns}
              />
            )}
          </BusyLoaderWrapper>
        </div>
        {isInfiniteLoading && (
          <div className='Infinite_Loader'>
            <CircularProgress />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default RunsTable;
