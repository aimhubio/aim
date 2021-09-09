import React, { memo } from 'react';
import useModel from 'hooks/model/useModel';
import Runs from './Runs';
import { ITableRef } from '../../types/components/Table/Table';
import runsAppModel from '../../services/models/runs/runsAppModel';
import tagsAppModel from '../../services/models/tags/tagsAppModel';
import metricAppModel from '../../services/models/metrics/metricsAppModel';

function RunsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const runsData = useModel(runsAppModel);

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
    return () => {
      runsRequestRef.abort();
    };
  }, []);

  return (
    <Runs
      hiddenRuns={runsData?.config?.table.hiddenMetrics!}
      tableData={runsData?.tableData}
      tableColumns={runsData?.tableColumns}
      isRunsDataLoading={runsData?.requestIsPending}
      isLatest={runsData?.config?.pagination.isLatest}
      onSelectRunQueryChange={runsAppModel.onSelectRunQueryChange}
      tableRowHeight={runsData?.config?.table?.rowHeight}
      tableRef={tableRef}
      columnsOrder={runsData?.config?.table.columnsOrder}
      query={runsData?.config?.select?.query}
      updateSelectStateUrl={runsAppModel.updateSelectStateUrl}
      onExportTableData={runsAppModel.onExportTableData}
      getLastRunsData={runsAppModel.getLastRunsData}
      isInfiniteLoading={runsData?.infiniteIsPending}
      onNotificationDelete={runsAppModel.onNotificationDelete}
      notifyData={runsData?.notifyData}
      onRowHeightChange={runsAppModel.onRowHeightChange}
      onRowsChange={runsAppModel.onRunsVisibilityChange}
      onManageColumns={runsAppModel.onColumnsOrderChange}
    />
  );
}

export default memo(RunsContainer);
