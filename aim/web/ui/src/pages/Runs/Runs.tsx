import React from 'react';

import NotificationContainer from 'components/NotificationContainer/NotificationContainer';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import RunsTable from './RunsTable';
import RunsBar from './components/RunsBar/RunsBar';
import SearchBar from './components/SearchBar/SearchBar';

import './Runs.scss';

function Runs(props: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className='Runs__container'>
        <section className='Runs__section'>
          <div className='Runs__section__div Runs__fullHeight'>
            <RunsBar
              {...{
                ...props.liveUpdateConfig,
                onLiveUpdateConfigChange: props.onLiveUpdateConfigChange,
              }}
            />
            <SearchBar
              onSearchInputChange={props.onSelectRunQueryChange}
              searchValue={props.query}
              isRunsDataLoading={props.isRunsDataLoading}
            />
            <div className='Runs__table__container'>
              <RunsTable
                columnsOrder={props.columnsOrder}
                hiddenColumns={props.hiddenColumns}
                onColumnsVisibilityChange={props.onColumnsVisibilityChange}
                onTableDiffShow={props.onTableDiffShow}
                onManageColumns={props.onManageColumns}
                onRowHeightChange={props.onRowHeightChange}
                data={props.tableData}
                isInfiniteLoading={props.isInfiniteLoading}
                isLatest={props.isLatest}
                onExportTableData={props.onExportTableData}
                tableRowHeight={props.tableRowHeight}
                columns={props.tableColumns}
                runsList={props.tableData}
                isRunsDataLoading={props.isRunsDataLoading}
                tableRef={props.tableRef}
                getLastRunsData={props.getLastRunsData}
                columnsWidths={props.columnsWidths}
                updateColumnsWidths={props.updateColumnsWidths}
                selectedRows={props.selectedRows}
                onRowSelect={props.onRowSelect}
                archiveRuns={props.archiveRuns}
                deleteRuns={props.deleteRuns}
              />
            </div>
            {props.notifyData?.length > 0 && (
              <NotificationContainer
                handleClose={props.onNotificationDelete}
                data={props.notifyData}
              />
            )}
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}

export default Runs;
