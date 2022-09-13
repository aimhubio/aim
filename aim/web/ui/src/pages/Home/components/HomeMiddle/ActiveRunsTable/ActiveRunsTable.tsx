import React from 'react';

import { Text } from 'components/kit';
import DataList from 'components/kit/DataList';

import useActiveRunsTable from './useActiveRunsTable';

function ActiveRunsTable() {
  const { data, tableRef, tableColumns, tableData, loading } =
    useActiveRunsTable();
  return (
    <div>
      <Text component='h1'>In Progress Runs</Text>
      <DataList
        withSearchBar={false}
        tableRef={tableRef}
        tableColumns={tableColumns}
        tableData={tableData}
        isLoading={loading}
        height='350px'
        illustrationConfig={{
          size: 'large',
          title: 'No Results',
        }}
      />
    </div>
  );
}
export default ActiveRunsTable;
