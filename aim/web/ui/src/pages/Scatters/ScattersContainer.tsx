import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useModel, usePanelResize, useResizeObserver } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import scattersAppModel from 'services/models/scatters/scattersAppModel';
import projectsModel from 'services/models/projects/projectsModel';
import * as analytics from 'services/analytics';
import { AppNameEnum } from 'services/models/explorer';

import { ITableRef } from 'types/components/Table/Table';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { IProjectsModelState } from 'types/services/models/projects/projectsModel';
import { IScatterAppModelState } from 'types/services/models/scatter/scatterAppModel';
import { IApiRequest } from 'types/services/services';

import setComponentRefs from 'utils/app/setComponentRefs';
import getStateFromUrl from 'utils/getStateFromUrl';
import exceptionHandler from 'utils/app/exceptionHandler';
import manageSystemMetricColumns from 'utils/app/manageSystemMetricColumns';

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
    useModel<Partial<IScatterAppModelState | any>>(scattersAppModel);
  const [chartPanelOffsetHeight, setChartPanelOffsetHeight] = React.useState(
    chartElemRef?.current?.offsetWidth,
  );
  const projectsData = useModel<Partial<IProjectsModelState>>(projectsModel);
  const panelResizing = usePanelResize(
    wrapperElemRef,
    chartElemRef,
    tableElemRef,
    resizeElemRef,
    scattersData?.config?.table,
    scattersAppModel.onTableResizeEnd,
  );

  useResizeObserver(() => {
    if (chartElemRef?.current?.offsetHeight !== chartPanelOffsetHeight) {
      setChartPanelOffsetHeight(chartElemRef?.current?.offsetHeight);
    }
  }, chartElemRef);

  React.useEffect(() => {
    if (tableRef.current && chartPanelRef.current) {
      setComponentRefs({
        model: scattersAppModel,
        refElement: {
          tableRef,
          chartPanelRef,
        },
      });
    }
    if (scattersData?.rawData?.length > 0) {
      manageSystemMetricColumns(scattersAppModel);
    }
  }, [scattersData?.rawData]);

  React.useEffect(() => {
    scattersAppModel.initialize(route.params.appId);
    let appRequestRef: IApiRequest<void>;
    if (route.params.appId) {
      appRequestRef = scattersAppModel.getAppConfigData(route.params.appId);
      appRequestRef
        .call((detail: any) => {
          exceptionHandler({ detail, model: scattersAppModel });
        })
        .then(() => {
          scattersAppModel.setDefaultAppConfigData(false);
          scattersAppModel.getScattersData().call((detail: any) => {
            exceptionHandler({ detail, model: scattersAppModel });
          });
        });
    } else {
      scattersAppModel.setDefaultAppConfigData();
    }
    const scattersRequestRef = scattersAppModel.getScattersData();
    scattersRequestRef.call((detail: any) => {
      exceptionHandler({ detail, model: scattersAppModel });
    });
    analytics.pageView(ANALYTICS_EVENT_KEYS.scatters.pageView);

    const unListenHistory = history.listen(() => {
      if (!!scattersData?.config) {
        if (
          (scattersData.config.grouping !== getStateFromUrl('grouping') ||
            scattersData.config.chart !== getStateFromUrl('chart') ||
            scattersData.config.select !== getStateFromUrl('select')) &&
          history.location.pathname === `/${AppNameEnum.SCATTERS}`
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <Scatters
        // refs
        tableRef={tableRef}
        chartPanelRef={chartPanelRef}
        tableElemRef={tableElemRef}
        chartElemRef={chartElemRef}
        wrapperElemRef={wrapperElemRef}
        resizeElemRef={resizeElemRef}
        // grouping options
        groupingData={scattersData?.config?.grouping!}
        // chart options
        panelResizing={panelResizing}
        scatterPlotData={scattersData?.chartData!}
        chartTitleData={scattersData?.chartTitleData!}
        tooltip={scattersData?.tooltip!}
        focusedState={scattersData?.config?.chart?.focusedState!}
        trendlineOptions={scattersData?.config?.chart?.trendlineOptions!}
        selectedOptionsData={scattersData?.config?.select!}
        notifyData={scattersData?.notifyData!}
        selectedRows={scattersData?.selectedRows!}
        tableData={scattersData?.tableData!}
        tableColumns={scattersData?.tableColumns!}
        tableRowHeight={scattersData?.config?.table?.rowHeight!}
        sortFields={scattersData?.config?.table?.sortFields!}
        hiddenMetrics={scattersData?.config?.table?.hiddenMetrics!}
        hideSystemMetrics={scattersData?.config?.table?.hideSystemMetrics!}
        hiddenColumns={scattersData?.config?.table?.hiddenColumns!}
        groupingSelectOptions={scattersData?.groupingSelectOptions!}
        sortOptions={scattersData?.sortOptions!}
        projectsDataMetrics={projectsData?.metrics!}
        requestStatus={scattersData?.requestStatus!}
        requestProgress={scattersData?.requestProgress!}
        resizeMode={scattersData?.config?.table?.resizeMode!}
        columnsWidths={scattersData?.config?.table?.columnsWidths!}
        selectFormData={scattersData?.selectFormData!}
        columnsOrder={scattersData?.config?.table?.columnsOrder!}
        sameValueColumns={scattersData?.sameValueColumns!}
        chartPanelOffsetHeight={chartPanelOffsetHeight}
        // methods
        onChangeTooltip={scattersAppModel.onChangeTooltip}
        onChangeTrendlineOptions={scattersAppModel.onChangeTrendlineOptions}
        onTableRowHover={scattersAppModel.onTableRowHover}
        onTableRowClick={scattersAppModel.onTableRowClick}
        updateColumnsWidths={scattersAppModel.updateColumnsWidths}
        onGroupingSelectChange={scattersAppModel.onGroupingSelectChange}
        onGroupingModeChange={scattersAppModel.onGroupingModeChange}
        onGroupingPaletteChange={scattersAppModel.onGroupingPaletteChange}
        onGroupingReset={scattersAppModel.onGroupingReset}
        onActivePointChange={scattersAppModel.onActivePointChange}
        onGroupingApplyChange={scattersAppModel.onGroupingApplyChange}
        onGroupingPersistenceChange={
          scattersAppModel.onGroupingPersistenceChange
        }
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
        onRunsTagsChange={scattersAppModel.onRunsTagsChange}
        // live update
        liveUpdateConfig={scattersData?.config?.liveUpdate!}
        onLiveUpdateConfigChange={scattersAppModel.changeLiveUpdateConfig}
        onShuffleChange={scattersAppModel.onShuffleChange}
        onSearchQueryCopy={scattersAppModel.onSearchQueryCopy}
        onRowSelect={scattersAppModel.onRowSelect}
        archiveRuns={scattersAppModel.archiveRuns}
        deleteRuns={scattersAppModel.deleteRuns}
        onRowsVisibilityChange={scattersAppModel.onRowsVisibilityChange}
      />
    </ErrorBoundary>
  );
}

export default ScattersContainer;
