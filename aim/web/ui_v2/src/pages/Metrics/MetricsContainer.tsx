import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';
import getTableColumns from './components/TableColumns/TableColumns';
import { ITableRef } from 'types/components/Table/Table';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';
import {
  calculateCentralMovingAverage,
  calculateExponentialMovingAverage,
  SmoothingAlgorithmEnum,
} from 'utils/smoothingData';
import { IHandleSmoothing } from 'types/pages/metrics/Metrics';
import { CurveEnum } from 'utils/d3';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const [displayOutliers, setDisplayOutliers] = React.useState<boolean>(true);
  const [zoomMode, setZoomMode] = React.useState<boolean>(false);
  const metricsData = useModel(metricsCollectionModel);
  const [data, setData] = React.useState<any>(null);
  const [curveInterpolation, setCurveInterpolation] = React.useState<CurveEnum>(
    CurveEnum.Linear,
  );

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
    if (metricsData?.collection) {
      setData(metricsData?.collection[0]);
    }
  }, [metricsData]);

  function handleSmoothing({
    algorithm,
    factor,
    curveInterpolation,
  }: IHandleSmoothing) {
    const newData = [...data];
    for (let i = 0; i < data.length; i++) {
      if (algorithm === SmoothingAlgorithmEnum.EMA) {
        newData[i].data.yValues = calculateExponentialMovingAverage(
          data[i].data.values,
          factor,
        );
      } else {
        newData[i].data.yValues = calculateCentralMovingAverage(
          data[i].data.values,
          factor,
        );
      }
    }
    setData(newData);
    setCurveInterpolation(curveInterpolation);
  }

  return (
    <Metrics
      tableRef={tableRef}
      displayOutliers={displayOutliers}
      toggleDisplayOutliers={toggleDisplayOutliers}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      metricsCollection={data ?? []}
      lineChartData={metricsCollectionModel.getDataAsLines()}
      tableData={metricsCollectionModel.getDataAsTableRows()}
      tableColumns={getTableColumns()}
      zoomMode={zoomMode}
      toggleZoomMode={toggleZoomMode}
      handleSmoothing={handleSmoothing}
      curveInterpolation={curveInterpolation}
    />
  );
}

export default MetricsContainer;
