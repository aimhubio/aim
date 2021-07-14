import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';
import {
  calculateCentralMovingAverage,
  calculateExponentialMovingAverage,
  SmoothingAlgorithmEnum,
} from 'utils/smoothingData';
import { IHandleSmoothing } from 'types/pages/metrics/Metrics';
import { CurveEnum } from '../../utils/d3';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const [displayOutliers, setDisplayOutliers] = React.useState<boolean>(true);
  const [zoomMode, setZoomMode] = React.useState<boolean>(false);
  const metricsData = useModel<any>(metricsCollectionModel);
  const [data, setData] = React.useState<any>(null);
  const [curveInterpolation, setCurveInterpolation] = React.useState<CurveEnum>(
    CurveEnum.Linear,
  );

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
      displayOutliers={displayOutliers}
      toggleDisplayOutliers={toggleDisplayOutliers}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      zoomMode={zoomMode}
      toggleZoomMode={toggleZoomMode}
      metricsCollection={data}
      handleSmoothing={handleSmoothing}
      curveInterpolation={curveInterpolation}
    />
  );
}

export default MetricsContainer;
