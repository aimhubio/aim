import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';
import getTableColumns from './components/TableColumns/TableColumns';
import { ITableRef } from 'types/components/Table/Table';
import usePanelResize from 'hooks/resize/usePanelResize';
import useModel from 'hooks/model/useModel';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const metricsData = useModel(metricsCollectionModel);

  const tableRef = React.useRef<ITableRef>(null);
  const [zoomMode, setZoomMode] = React.useState<boolean>(false);
  const [displayOutliers, setDisplayOutliers] = React.useState<boolean>(true);

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

  return (
    <Metrics
      tableRef={tableRef}
      displayOutliers={displayOutliers}
      toggleDisplayOutliers={toggleDisplayOutliers}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      resizeElemRef={resizeElemRef}
      metricsCollection={metricsData?.collection ?? []}
      lineChartData={metricsCollectionModel.getDataAsLines()}
      tableData={metricsCollectionModel.getDataAsTableRows()}
      tableColumns={getTableColumns()}
      zoomMode={zoomMode}
      toggleZoomMode={toggleZoomMode}
    />
  );
}

export default MetricsContainer;
