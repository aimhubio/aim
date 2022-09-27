import * as React from 'react';

import { Text } from 'components/kit';
import Table from 'components/Table/Table';

import { RowHeightSize } from 'config/table/tableConfigs';

import { AppNameEnum } from 'services/models/explorer';

import useActiveRunsTable from './useActiveRunsTable';

function ActiveRunsTable() {
  const { data, tableRef, tableColumns, tableData, loading } =
    useActiveRunsTable();

  return (
    <div>
      <Text component='h1'>In Progress Runs</Text>
      <Table
        custom
        topHeader
        multiSelect
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
      />
    </div>
  );
}
export default ActiveRunsTable;
