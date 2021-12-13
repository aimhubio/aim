import React from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';

import { RowHeightSize } from 'config/table/tableConfigs';
import { ResizeModeEnum } from 'config/enums/tableEnums';

import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';

import scattersAppModel from 'services/models/scatters/scattersAppModel';
import projectsModel from 'services/models/projects/projectsModel';
import * as analytics from 'services/analytics';

import { ITableRef } from 'types/components/Table/Table';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import {
  IAppData,
  IChartTitleData,
  IFocusedState,
  IGroupingSelectOption,
  IMetricTableRowData,
  IPanelTooltip,
} from 'types/services/models/metrics/metricsAppModel';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import {
  IProjectParamsMetrics,
  IProjectsModelState,
} from 'types/services/models/projects/projectsModel';
import { IScatterAppModelState } from 'types/services/models/scatter/scatterAppModel';
import {
  IGroupingConfig,
  ILiveUpdateConfig,
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
        scattersAppModel.getScattersData().call();
      });
    } else {
      scattersAppModel.setDefaultAppConfigData();
    }
    const scattersRequestRef = scattersAppModel.getScattersData();
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
      focusedState={scattersData?.config?.chart?.focusedState as IFocusedState}
      tooltip={scattersData?.config?.chart?.tooltip as IPanelTooltip}
      selectedOptionsData={scattersData?.config?.select as ISelectConfig}
      notifyData={
        scattersData?.notifyData as IScatterAppModelState['notifyData']
      }
      tableData={scattersData?.tableData as IMetricTableRowData[]}
      tableColumns={scattersData?.tableColumns as ITableColumn[]}
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
      onTableRowHover={scattersAppModel.onTableRowHover}
      onTableRowClick={scattersAppModel.onTableRowClick}
      updateColumnsWidths={scattersAppModel.updateColumnsWidths}
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
      onExportTableData={scattersAppModel.onExportTableData}
      onRowHeightChange={scattersAppModel.onRowHeightChange}
      onSortChange={scattersAppModel.onSortChange}
      onSortReset={scattersAppModel.onSortReset}
      onParamVisibilityChange={scattersAppModel.onParamVisibilityChange}
      onColumnsOrderChange={scattersAppModel.onColumnsOrderChange}
      onColumnsVisibilityChange={scattersAppModel.onColumnsVisibilityChange}
      onTableDiffShow={scattersAppModel.onTableDiffShow}
      onTableResizeModeChange={scattersAppModel.onTableResizeModeChange}
      // live update
      liveUpdateConfig={scattersData?.config?.liveUpdate as ILiveUpdateConfig}
      onLiveUpdateConfigChange={scattersAppModel.changeLiveUpdateConfig}
      onShuffleChange={scattersAppModel.onShuffleChange}
      onSearchQueryCopy={scattersAppModel.onSearchQueryCopy}
    />
  );
}

export default ScattersContainer;
