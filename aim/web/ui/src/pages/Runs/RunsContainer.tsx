import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';
import { useModel } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import runsAppModel from 'services/models/runs/runsAppModel';
import * as analytics from 'services/analytics';
import { AppNameEnum } from 'services/models/explorer';

import { ITableRef } from 'types/components/Table/Table';

import setComponentRefs from 'utils/app/setComponentRefs';
import getStateFromUrl from 'utils/getStateFromUrl';
import manageSystemMetricColumns from 'utils/app/manageSystemMetricColumns';

import Runs from './Runs';

function RunsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const runsData = useModel<any>(runsAppModel);
  const history = useHistory();

  React.useEffect(() => {
    if (tableRef.current) {
      setComponentRefs({
        refElement: {
          tableRef,
        },
        model: runsAppModel,
      });
    }
    if (runsData?.data?.length > 0) {
      manageSystemMetricColumns(runsAppModel);
    }
  }, [runsData?.data]);

  React.useEffect(() => {
    runsAppModel.initialize();
    analytics.pageView(ANALYTICS_EVENT_KEYS.runs.pageView);
    const unListenHistory = history.listen(() => {
      if (!!runsData?.config!) {
        if (
          runsData.config.select !== getStateFromUrl('search') &&
          history.location.pathname === `/${AppNameEnum.RUNS}`
        ) {
          runsAppModel.setDefaultAppConfigData();
        }
      }
    });
    return () => {
      unListenHistory();
      runsAppModel.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <Runs
        tableData={runsData?.tableData}
        tableColumns={runsData?.tableColumns}
        requestStatus={runsData?.requestStatus}
        requestProgress={runsData?.requestProgress!}
        isLatest={runsData?.config?.pagination.isLatest}
        onSelectRunQueryChange={runsAppModel.onSelectRunQueryChange}
        onToggleColumnsColorScales={runsAppModel.onToggleColumnsColorScales}
        tableRowHeight={runsData?.config?.table?.rowHeight}
        metricsValueKey={runsData?.config?.table?.metricsValueKey}
        sameValueColumns={runsData?.sameValueColumns!}
        tableRef={tableRef}
        columnsOrder={runsData?.config?.table.columnsOrder}
        hiddenColumns={runsData?.config?.table.hiddenColumns!}
        hideSystemMetrics={runsData?.config?.table?.hideSystemMetrics}
        selectedRows={runsData?.selectedRows}
        query={runsData?.config?.select?.query}
        selectFormData={runsData?.selectFormData!}
        columnsWidths={runsData?.config?.table.columnsWidths}
        onExportTableData={runsAppModel.onExportTableData}
        updateColumnsWidths={runsAppModel.updateColumnsWidths}
        getLastRunsData={runsAppModel.getLastRunsData}
        isInfiniteLoading={runsData?.infiniteIsPending}
        onNotificationDelete={runsAppModel.onNotificationDelete}
        notifyData={runsData?.notifyData}
        columnsColorScales={runsData?.config?.table?.columnsColorScales}
        onRowHeightChange={runsAppModel.onRowHeightChange}
        onManageColumns={runsAppModel.onColumnsOrderChange}
        onColumnsVisibilityChange={runsAppModel.onColumnsVisibilityChange}
        onTableDiffShow={runsAppModel.onTableDiffShow}
        liveUpdateConfig={runsData?.config?.liveUpdate}
        onLiveUpdateConfigChange={runsAppModel.changeLiveUpdateConfig}
        onRowSelect={runsAppModel.onRowSelect}
        archiveRuns={runsAppModel.archiveRuns}
        deleteRuns={runsAppModel.deleteRuns}
        onMetricsValueKeyChange={runsAppModel.onMetricsValueKeyChange}
      />
    </ErrorBoundary>
  );
}

export default memo(RunsContainer);
