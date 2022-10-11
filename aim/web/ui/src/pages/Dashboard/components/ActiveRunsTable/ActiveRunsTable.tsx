import * as React from 'react';
import classNames from 'classnames';

import { Spinner, Text } from 'components/kit';
import Table from 'components/Table/Table';

import { RowHeightSize } from 'config/table/tableConfigs';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import useActiveRunsTable from './useActiveRunsTable';

import './ActiveRunsTable.scss';

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
    <div className='ActiveRunsTable'>
      <div className='ActiveRunsTable__header'>
        <Text
          className='ActiveRunsTable__header__title'
          component='h3'
          size={14}
          weight={700}
          tint={100}
        >
          Active runs {tableData.length > 0 ? `(${tableData.length})` : ''}
        </Text>
        {tableData.length > 0 && (
          <div className='ActiveRunsTable__header__comparisonPopover'>
            <CompareSelectedRunsPopover
              appName={'dashboard' as AppNameEnum} // @TODO: change to Dashboard
              query={comparisonQuery}
              disabled={Object.keys(selectedRows).length === 0}
            />
          </div>
        )}
      </div>
      <div
        className={classNames('ActiveRunsTable__table', {
          'ActiveRunsTable__table--loading': loading,
          'ActiveRunsTable__table--empty': tableData.length === 0,
        })}
      >
        {loading ? (
          <Spinner />
        ) : (
          <Table
            custom
            topHeader
            multiSelect
            noColumnActions
            hideHeaderActions
            showRowClickBehaviour={false}
            showResizeContainerActionBar={false}
            appName={'dashboard' as AppNameEnum} // @TODO: change to Dashboard
            ref={tableRef}
            columns={tableColumns}
            data={tableData}
            isLoading={loading}
            height='100%'
            rowHeight={RowHeightSize.sm}
            illustrationConfig={{
              size: 'large',
              title: 'No active runs',
            }}
            selectedRows={selectedRows}
            onRowSelect={onRowSelect}
          />
        )}
      </div>
    </div>
  );
}
export default ActiveRunsTable;
