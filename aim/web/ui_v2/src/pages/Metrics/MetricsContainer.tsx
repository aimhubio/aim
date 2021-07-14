import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const [displayOutliers, setDisplayOutliers] = React.useState<boolean>(true);
  const [zoomMode, setZoomMode] = React.useState<boolean>(false);
  const [highlightMode, setHighlightMode] = React.useState<number>(0);

  const metricsData = useModel<any>(metricsCollectionModel);

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

  const handleChangeHighlightMode = React.useCallback(
    (mode: number) => (): void => {
      setHighlightMode(mode);
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
      metricsCollection={metricsData?.collection}
      highlightMode={highlightMode}
      handleChangeHighlightMode={handleChangeHighlightMode}
    />
  );
}

export default MetricsContainer;
