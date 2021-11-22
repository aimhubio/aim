import React from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';

import scattersAppModel from 'services/models/scatters/scattersAppModel';
import projectsModel from 'services/models/projects/projectsModel';
import * as analytics from 'services/analytics';

import { ITableRef } from 'types/components/Table/Table';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import {
  IAppData,
  IChartTitleData,
  IChartTooltip,
  IChartZoom,
  IFocusedState,
  IGroupingSelectOption,
  IMetricTableRowData,
} from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  IProjectParamsMetrics,
  IProjectsModelState,
} from 'types/services/models/projects/projectsModel';
import { IScatterAppModelState } from 'types/services/models/scatter/scatterAppModel';
import {
  IGroupingConfig,
  ISelectConfig,
} from 'types/services/models/explorer/createAppModel';

import setComponentRefs from 'utils/app/setComponentRefs';
import getStateFromUrl from 'utils/getStateFromUrl';

import Scatters from './Scatters';

function ScattersContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);
  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);
  const route = useRouteMatch<any>();
  const history = useHistory();
  const scattersData =
    useModel<Partial<IScatterAppModelState>>(scattersAppModel);

  const projectsData = useModel<Partial<IProjectsModelState>>(projectsModel);
  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
    scattersData?.config?.table,
    scattersAppModel.onTableResizeEnd,
  );

  React.useEffect(() => {
    if (tableRef.current && chartPanelRef.current) {
      setComponentRefs<IScatterAppModelState>({
        model: scattersAppModel,
        refElement: {
          tableRef,
          chartPanelRef,
        },
      });
    }
  }, [scattersData?.rawData]);

  React.useEffect(() => {
    scattersAppModel.initialize(route.params.appId);
    let appRequestRef: {
      call: () => Promise<IAppData | void>;
      abort: () => void;
    };
    if (route.params.appId) {
      appRequestRef = scattersAppModel.getAppConfigData(route.params.appId);
      appRequestRef.call().then(() => {
        scattersAppModel.getMetricsData().call();
      });
    } else {
      scattersAppModel.setDefaultAppConfigData();
    }
    const scattersRequestRef = scattersAppModel.getParamsData();
    scattersRequestRef.call();
    analytics.pageView('[ScattersExplorer]');

    const unListenHistory = history.listen(() => {
      if (!!scattersData?.config) {
        if (
          scattersData.config.grouping !== getStateFromUrl('grouping') ||
          scattersData.config.chart !== getStateFromUrl('chart') ||
          scattersData.config.select !== getStateFromUrl('select')
        ) {
          scattersAppModel.setDefaultAppConfigData();
          scattersAppModel.updateModelData();
        }
      }
    });
    return () => {
      scattersAppModel.destroy();
      scattersRequestRef.abort();
      unListenHistory();
      if (appRequestRef) {
        appRequestRef.abort();
      }
    };
  }, []);

  return (
    <Scatters
      // refs
      tableRef={tableRef}
      chartPanelRef={chartPanelRef}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      // grouping options
      groupingData={scattersData?.config?.grouping as IGroupingConfig}
      // chart options
      panelResizing={panelResizing}
      scatterPlotData={scattersData?.chartData as any[]}
      chartTitleData={scattersData?.chartTitleData as IChartTitleData}
      ignoreOutliers={scattersData?.config?.chart?.ignoreOutliers as boolean}
      tableData={scattersData?.tableData as IMetricTableRowData[]}
      tableColumns={scattersData?.tableColumns as ITableColumn[]}
      zoom={scattersData?.config?.chart?.zoom as IChartZoom}
      highlightMode={
        scattersData?.config?.chart?.highlightMode as HighlightEnum
      }
      axesScaleType={
        scattersData?.config?.chart?.axesScaleType as IAxesScaleState
      }
      focusedState={scattersData?.config?.chart?.focusedState as IFocusedState}
      notifyData={
        scattersData?.notifyData as IScatterAppModelState['notifyData']
      }
      tooltip={scattersData?.config?.chart?.tooltip as IChartTooltip}
      selectedOptionsData={scattersData?.config?.select as ISelectConfig}
      tableRowHeight={scattersData?.config?.table?.rowHeight as RowHeightSize}
      sortFields={scattersData?.config?.table?.sortFields!}
      hiddenMetrics={scattersData?.config?.table?.hiddenMetrics!}
      hiddenColumns={scattersData?.config?.table?.hiddenColumns!}
      groupingSelectOptions={
        scattersData?.groupingSelectOptions as IGroupingSelectOption[]
      }
      projectsDataMetrics={
        projectsData?.metrics as IProjectParamsMetrics['metric']
      }
      requestIsPending={scattersData?.requestIsPending as boolean}
      resizeMode={scattersData?.config?.table?.resizeMode as ResizeModeEnum}
      columnsWidths={scattersData?.config?.table?.columnsWidths!}
      // methods
      onChangeTooltip={scattersAppModel.onChangeTooltip}
      onIgnoreOutliersChange={scattersAppModel.onIgnoreOutliersChange}
      onZoomChange={scattersAppModel.onZoomChange}
      onHighlightModeChange={scattersAppModel.onHighlightModeChange}
      onTableRowHover={scattersAppModel.onTableRowHover}
      onTableRowClick={scattersAppModel.onTableRowClick}
      updateColumnsWidths={scattersAppModel.updateColumnsWidths}
      onAxesScaleTypeChange={scattersAppModel.onAxesScaleTypeChange}
      onGroupingSelectChange={scattersAppModel.onGroupingSelectChange}
      onGroupingModeChange={scattersAppModel.onGroupingModeChange}
      onGroupingPaletteChange={scattersAppModel.onGroupingPaletteChange}
      onGroupingReset={scattersAppModel.onGroupingReset}
      onActivePointChange={scattersAppModel.onActivePointChange}
      onGroupingApplyChange={scattersAppModel.onGroupingApplyChange}
      onGroupingPersistenceChange={scattersAppModel.onGroupingPersistenceChange}
      onBookmarkCreate={scattersAppModel.onBookmarkCreate}
      onBookmarkUpdate={scattersAppModel.onBookmarkUpdate}
      onNotificationAdd={scattersAppModel.onNotificationAdd}
      onNotificationDelete={scattersAppModel.onNotificationDelete}
      onResetConfigData={scattersAppModel.onResetConfigData}
      onSelectOptionsChange={scattersAppModel.onSelectOptionsChange}
      onSelectRunQueryChange={scattersAppModel.onSelectRunQueryChange}
      onSelectAdvancedQueryChange={scattersAppModel.onSelectAdvancedQueryChange}
      toggleSelectAdvancedMode={scattersAppModel.toggleSelectAdvancedMode}
      onExportTableData={scattersAppModel.onExportTableData}
      onRowHeightChange={scattersAppModel.onRowHeightChange}
      onSortChange={scattersAppModel.onSortChange}
      onSortReset={scattersAppModel.onSortReset}
      onMetricVisibilityChange={scattersAppModel.onMetricVisibilityChange}
      onColumnsOrderChange={scattersAppModel.onColumnsOrderChange}
      onColumnsVisibilityChange={scattersAppModel.onColumnsVisibilityChange}
      onTableDiffShow={scattersAppModel.onTableDiffShow}
      onTableResizeModeChange={scattersAppModel.onTableResizeModeChange}
      // live update
      liveUpdateConfig={scattersAppModel.config?.liveUpdate}
      onLiveUpdateConfigChange={scattersAppModel.changeLiveUpdateConfig}
      onShuffleChange={scattersAppModel.onShuffleChange}
      onSearchQueryCopy={scattersAppModel.onSearchQueryCopy}
    />
  );
}

export default ScattersContainer;
