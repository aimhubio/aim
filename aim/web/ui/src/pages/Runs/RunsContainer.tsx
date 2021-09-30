import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';

import * as analytics from 'services/analytics';
import useModel from 'hooks/model/useModel';
import { ITableRef } from 'types/components/Table/Table';
import runsAppModel from 'services/models/runs/runsAppModel';
import getStateFromUrl from 'utils/getStateFromUrl';
import Runs from './Runs';

function RunsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const runsData = useModel(runsAppModel);
  const location = useLocation();

  React.useEffect(() => {
    if (tableRef.current) {
      runsAppModel.setComponentRefs({
        tableRef,
      });
    }
  }, [runsData?.data]);

  React.useEffect(() => {
    const runsRequestRef = runsAppModel.initialize();
    runsRequestRef.call();
    analytics.pageView('[RunsExplorer]');
    return () => {
      runsRequestRef.abort();
      runsAppModel.destroy();
    };
  }, []);

  // Add effect to recover state from URL when browser history navigation is used
  React.useEffect(() => {
    if (!!runsData?.config!) {
      if (runsData.config.select !== getStateFromUrl('search')) {
        runsAppModel.setDefaultAppConfigData();
      }
    }
  }, [location.search]);

  return (
    <Runs
      tableData={runsData?.tableData}
      tableColumns={runsData?.tableColumns}
      isRunsDataLoading={runsData?.requestIsPending}
      isLatest={runsData?.config?.pagination.isLatest}
      onSelectRunQueryChange={runsAppModel.onSelectRunQueryChange}
      tableRowHeight={runsData?.config?.table?.rowHeight}
      tableRef={tableRef}
      columnsOrder={runsData?.config?.table.columnsOrder}
      hiddenColumns={runsData?.config?.table.hiddenColumns ?? []}
      query={runsData?.config?.select?.query}
      columnsWidths={runsData?.config?.table.columnsWidths}
      updateSelectStateUrl={runsAppModel.updateSelectStateUrl}
      onExportTableData={runsAppModel.onExportTableData}
      updateColumnsWidths={runsAppModel.updateColumnsWidths}
      getLastRunsData={runsAppModel.getLastRunsData}
      isInfiniteLoading={runsData?.infiniteIsPending}
      onNotificationDelete={runsAppModel.onNotificationDelete}
      notifyData={runsData?.notifyData}
      onRowHeightChange={runsAppModel.onRowHeightChange}
      onManageColumns={runsAppModel.onColumnsOrderChange}
      onColumnsVisibilityChange={runsAppModel.onColumnsVisibilityChange}
      onTableDiffShow={runsAppModel.onTableDiffShow}
      liveUpdateConfig={runsData?.liveUpdateConfig}
      onLiveUpdateConfigChange={runsAppModel.changeLiveUpdateConfig}
    />
  );
}

export default memo(RunsContainer);
