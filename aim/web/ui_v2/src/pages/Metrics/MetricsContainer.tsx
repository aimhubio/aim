import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';
import getTableColumns from './components/TableColumns/TableColumns';
import { ITableRef } from 'types/components/Table/Table';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { CurveEnum, ScaleEnum } from 'utils/d3';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const [displayOutliers, setDisplayOutliers] = React.useState<boolean>(true);
  const [zoomMode, setZoomMode] = React.useState<boolean>(false);
  const metricsData = useModel(metricsCollectionModel);
  const [lineChartData, setLineChartData] = React.useState<any>([]);
  const [curveInterpolation, setCurveInterpolation] = React.useState<CurveEnum>(
    CurveEnum.Linear,
  );
  const [axesScaleType, setAxesScaleType] = React.useState<IAxesScaleState>({
    xAxis: ScaleEnum.Linear,
    yAxis: ScaleEnum.Linear,
  });
  const tableRef = React.useRef<ITableRef>(null);
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

  React.useEffect(() => {
    metricsCollectionModel.initialize();
    metricsRequestRef.call();

    // tableRef.current?.updateData({
    //   newData: metricsCollectionModel.getDataAsTableRows(xValue)[0],
    // });
    return () => {
      metricsRequestRef.abort();
    };
  }, []);

  React.useEffect(() => {
    if (metricsCollectionModel.getDataAsLines()[0]?.length) {
      setLineChartData(metricsCollectionModel.getDataAsLines()[0]);
    }
  }, [metricsData]);

  const onSmoothingChange = React.useCallback(
    ({ algorithm, factor, curveInterpolation }: IOnSmoothingChange): void => {
      let newData = metricsCollectionModel.getDataAsLines({
        algorithm,
        factor,
      })[0];
      setLineChartData(newData);
      setCurveInterpolation(curveInterpolation);
    },
    [],
  );

  const onAxesScaleTypeChange = React.useCallback(
    (params: IAxesScaleState): void => {
      setAxesScaleType({ ...params });
    },
    [],
  );

  return (
    <Metrics
      tableRef={tableRef}
      displayOutliers={displayOutliers}
      toggleDisplayOutliers={toggleDisplayOutliers}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      lineChartData={lineChartData}
      tableData={metricsCollectionModel.getDataAsTableRows()}
      tableColumns={getTableColumns()}
      zoomMode={zoomMode}
      toggleZoomMode={toggleZoomMode}
      onSmoothingChange={onSmoothingChange}
      onAxesScaleTypeChange={onAxesScaleTypeChange}
      axesScaleType={axesScaleType}
      curveInterpolation={curveInterpolation}
    />
  );
}

export default MetricsContainer;
