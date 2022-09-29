import * as React from 'react';

import { Text } from 'components/kit';
import Table from 'components/Table/Table';

import { RowHeightSize } from 'config/table/tableConfigs';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import useActiveRunsTable from './useActiveRunsTable';

function ActiveRunsTable() {
  const {
    tableRef,
    tableColumns,
    tableData,
    loading,
    selectedRows,
    comparisonQuery,
    onRowSelect,
  } = useActiveRunsTable();

  return (
    <div>
      <Text component='h1'>In Progress Runs</Text>
      <div className='DataList__toolbarItems'>
        {
          <CompareSelectedRunsPopover
            key='compareSelectedRunsPopover'
            appName={'home' as AppNameEnum}
            query={comparisonQuery}
            disabled={Object.keys(selectedRows).length === 0}
          />
        }
      </div>
      <Table
        custom
        topHeader
        multiSelect
        noColumnActions
        hideHeaderActions
        showRowClickBehaviour={false}
        showResizeContainerActionBar={false}
        appName={AppNameEnum.RUNS} // @TODO: change to Dashboard
        ref={tableRef}
        columns={tableColumns}
        data={tableData}
        isLoading={loading}
        height='350px'
        rowHeight={RowHeightSize.sm}
        illustrationConfig={{
          size: 'large',
          title: 'No active runs',
        }}
        selectedRows={selectedRows}
        onRowSelect={onRowSelect}
      />
    </div>
  );
}
export default ActiveRunsTable;
