import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';
import getTableColumns from './components/TableColumns/TableColumns';
import { ITableRef } from 'types/components/Table/Table';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';
import { IActivePointData } from 'types/utils/d3/drawHoverAttributes';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IChartPanelRef } from 'types/components/ChartPanel/ChartPanel';
import { CurveEnum, ScaleEnum } from 'utils/d3';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const [displayOutliers, setDisplayOutliers] = React.useState<boolean>(true);
  const [zoomMode, setZoomMode] = React.useState<boolean>(false);
  const [lineChartData, setLineChartData] = React.useState<any>([]);
  const [tableData, setTableData] = React.useState<any>([]);
  const [curveInterpolation, setCurveInterpolation] = React.useState<CurveEnum>(
    CurveEnum.Linear,
  );
  const [axesScaleType, setAxesScaleType] = React.useState<IAxesScaleState>({
    xAxis: ScaleEnum.Linear,
    yAxis: ScaleEnum.Linear,
  });
  const [highlightMode, setHighlightMode] = React.useState<HighlightEnum>(
    HighlightEnum.Off,
  );

  const metricsData = useModel(metricsCollectionModel);
  const tableRef = React.useRef<ITableRef>(null);
  const chartPanelRef = React.useRef<IChartPanelRef>(null);

  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);
  const resizeElemRef = React.useRef<HTMLDivElement>(null);

  usePanelResize(wrapperElemRef, chartElemRef, tableElemRef, resizeElemRef);

  const toggleDisplayOutliers = React.useCallback((): void => {
    setDisplayOutliers(!displayOutliers);
  }, [displayOutliers]);

  const toggleZoomMode = React.useCallback((): void => {
    setZoomMode(!zoomMode);
  }, [zoomMode]);

  const onActivePointChange = React.useCallback(
    (activePointData: IActivePointData): void => {
      tableRef.current?.updateData({
        newData: metricsCollectionModel
          .getDataAsTableRows(activePointData.xValue)
          .flat(),
      });
      tableRef.current?.setHoveredRow(activePointData.key);
    },
    [],
  );

  const onChangeHighlightMode = React.useCallback(
    (mode: number) => (): void => {
      setHighlightMode(mode);
    },
    [],
  );

  function onTableRowHover(rowKey: string) {
    chartPanelRef.current?.setActiveLine(rowKey);
  }

  function onSmoothingChange({
    algorithm,
    factor,
    curveInterpolation,
  }: IOnSmoothingChange) {
    let newData = metricsCollectionModel.getDataAsLines({
      smoothingAlgorithm: algorithm,
      smoothingFactor: factor,
    });
    setLineChartData(newData);
    setCurveInterpolation(curveInterpolation);
  }

  const onAxesScaleTypeChange = React.useCallback(
    (params: IAxesScaleState): void => {
      setAxesScaleType(params);
    },
    [],
  );

  React.useEffect(() => {
    metricsCollectionModel.initialize();
    metricsRequestRef.call();
    return () => {
      metricsRequestRef.abort();
    };
  }, []);

  React.useEffect(() => {
    if (metricsCollectionModel.getDataAsLines()[0]?.length) {
      setLineChartData(metricsCollectionModel.getDataAsLines());
      setTableData(metricsCollectionModel.getDataAsTableRows());
    }
  }, [metricsData]);

  return (
    <Metrics
      tableRef={tableRef}
      chartPanelRef={chartPanelRef}
      displayOutliers={displayOutliers}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      lineChartData={lineChartData}
      tableData={tableData}
      tableColumns={getTableColumns()}
      zoomMode={zoomMode}
      curveInterpolation={curveInterpolation}
      axesScaleType={axesScaleType}
      toggleDisplayOutliers={toggleDisplayOutliers}
      toggleZoomMode={toggleZoomMode}
      onActivePointChange={onActivePointChange}
      highlightMode={highlightMode}
      onChangeHighlightMode={onChangeHighlightMode}
      onSmoothingChange={onSmoothingChange}
      onTableRowHover={onTableRowHover}
      onAxesScaleTypeChange={onAxesScaleTypeChange}
    />
  );
}

export default MetricsContainer;
