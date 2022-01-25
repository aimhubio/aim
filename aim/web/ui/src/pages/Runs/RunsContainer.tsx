import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

import useModel from 'hooks/model/useModel';

import runsAppModel from 'services/models/runs/runsAppModel';
import * as analytics from 'services/analytics';

import { ITableRef } from 'types/components/Table/Table';

import setComponentRefs from 'utils/app/setComponentRefs';
import getStateFromUrl from 'utils/getStateFromUrl';

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
  }, [runsData?.data]);

  React.useEffect(() => {
    const runsRequestRef = runsAppModel.initialize();
    runsRequestRef.call();
    analytics.pageView('[RunsExplorer]');
    const unListenHistory = history.listen((location) => {
      if (!!runsData?.config!) {
        if (runsData.config.select !== getStateFromUrl('search')) {
          runsAppModel.setDefaultAppConfigData();
        }
      }
    });
    return () => {
      unListenHistory();
      runsRequestRef.abort();
      runsAppModel.destroy();
    };
  }, []);

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
      selectedRows={runsData?.selectedRows}
      query={runsData?.config?.select?.query}
      columnsWidths={runsData?.config?.table.columnsWidths}
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
      liveUpdateConfig={runsData?.config?.liveUpdate}
      onLiveUpdateConfigChange={runsAppModel.changeLiveUpdateConfig}
      onRowSelect={runsAppModel.onRowSelect}
      archiveRuns={runsAppModel.archiveRuns}
      deleteRuns={runsAppModel.deleteRuns}
    />
  );
}

export default memo(RunsContainer);
