import _ from 'lodash-es';
import classNames from 'classnames';

import { Skeleton } from '@material-ui/lab';

import { Spinner, Text } from 'components/kit';
import Table from 'components/Table/Table';

import { RowHeightSize } from 'config/table/tableConfigs';

import CompareSelectedRunsPopover from 'pages/Metrics/components/Table/CompareSelectedRunsPopover';

import { AppNameEnum } from 'services/models/explorer';

import { IExperimentRunsTableProps, useExperimentRunsTable } from '.';

import './ExperimentRunsTable.scss';

function ExperimentRunsTable({
  experimentName,
  experimentId,
}: IExperimentRunsTableProps) {
  const {
    tableRef,
    tableColumns,
    tableData,
    loading,
    selectedRows,
    comparisonQuery,
    onRowSelect,
    loadMore,
    isInfiniteLoading,
    totalRunsCount,
  } = useExperimentRunsTable(experimentName, experimentId);

  return (
    <div className='ExperimentRunsTable'>
      <div className='ExperimentRunsTable__header'>
        <div className='ExperimentRunsTable__header__titleBox'>
          <Text
            className='ExperimentRunsTable__header__titleBox__title'
            component='h3'
            size={14}
            weight={700}
            tint={100}
          >
            {_.isEmpty(selectedRows)
              ? 'Experiment Runs'
              : `Selected Runs (${Object.values(selectedRows).length})`}
          </Text>
          {_.isEmpty(selectedRows) ? (
            loading ? (
              <Skeleton variant='rect' height={17} width={50} />
            ) : (
              <Text component='h3' size={14} weight={700} tint={100}>
                {!_.isEmpty(tableData)
                  ? ` (${tableData?.length}/${totalRunsCount})`
                  : '(0)'}
              </Text>
            )
          ) : null}
        </div>
        {tableData?.length > 0 ? (
          <div className='ExperimentRunsTable__header__comparisonPopover'>
            <CompareSelectedRunsPopover
              appName={'experiment' as AppNameEnum} // @TODO: change to Experiment
              query={comparisonQuery}
              disabled={Object.keys(selectedRows).length === 0}
            />
          </div>
        ) : null}
      </div>
      <div
        className={classNames('ExperimentRunsTable__table', {
          'ExperimentRunsTable__table--loading': loading,
          'ExperimentRunsTable__table--empty': tableData.length === 0,
        })}
      >
        {_.isEmpty(tableData) && loading ? (
          <Spinner />
        ) : (
          <Table
            custom
            allowInfiniteLoading
            isInfiniteLoading={false}
            showRowClickBehaviour={false}
            infiniteLoadHandler={loadMore}
            showResizeContainerActionBar={false}
            ref={tableRef}
            data={tableData}
            columns={tableColumns}
            appName={AppNameEnum.RUNS}
            multiSelect
            topHeader
            noColumnActions
            hideHeaderActions
            isLoading={false}
            height='100%'
            rowHeight={RowHeightSize.sm}
            illustrationConfig={{
              size: 'large',
              title: 'No experiment runs',
            }}
            selectedRows={selectedRows}
            onRowSelect={onRowSelect}
          />
        )}
        {isInfiniteLoading && (
          <div className='Infinite_Loader'>
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
export default ExperimentRunsTable;
