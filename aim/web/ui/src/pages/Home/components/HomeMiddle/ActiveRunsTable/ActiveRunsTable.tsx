import * as React from 'react';

import { Text } from 'components/kit';
import Table from 'components/Table/Table';

import { RowHeightSize } from 'config/table/tableConfigs';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import useActiveRunsTable from './useActiveRunsTable';

import './ActiveRunsTable.scss';

function ActiveRunsTable() {
  const {
    data,
    tableRef,
    tableColumns,
    tableData,
    loading,
    selectedRows,
    comparisonQuery,
    onRowSelect,
  } = useActiveRunsTable();

  return (
    <div className='ActiveRunsTable'>
      <div className='ActiveRunsTable__header'>
        <Text
          className='ActiveRunsTable__header__title'
          component='h3'
          size={14}
          weight={700}
          tint={100}
        >
          Active runs {data?.length ? `(${data?.length})` : ''}
        </Text>
        <div className='ActiveRunsTable__header__comparisonPopover'>
          <CompareSelectedRunsPopover
            key='compareSelectedRunsPopover'
            appName={'home' as AppNameEnum}
            query={comparisonQuery}
            disabled={Object.keys(selectedRows).length === 0}
          />
        </div>
      </div>
      <div className='ActiveRunsTable__table'>
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
          height={'231px'}
          rowHeight={RowHeightSize.sm}
          illustrationConfig={{
            size: 'large',
            title: 'No active runs',
          }}
          selectedRows={selectedRows}
          onRowSelect={onRowSelect}
        />
      </div>
    </div>
  );
}
export default ActiveRunsTable;
