import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import useModel from 'hooks/model/useModel';
import Metrics from './Metrics';
import getTableColumns from './components/TableColumns/TableColumns';
import { ITableRef } from 'types/components/Table/Table';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const [displayOutliers, setDisplayOutliers] = React.useState<boolean>(true);
  const metricsData = useModel<any>(metricsCollectionModel);

  const tableRef = React.useRef<ITableRef>(null);

  const tableElemRef = React.useRef<HTMLDivElement>(null);
  const chartElemRef = React.useRef<HTMLDivElement>(null);
  const wrapperElemRef = React.useRef<HTMLDivElement>(null);

  const handleResize = React.useCallback(() => {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }, []);

  const startResize = React.useCallback((event: MouseEvent): void => {
    requestAnimationFrame(() => {
      if (
        tableElemRef.current &&
        chartElemRef.current &&
        wrapperElemRef.current
      ) {
        const containerHeight: number =
          tableElemRef.current.getBoundingClientRect()?.height +
          chartElemRef.current.getBoundingClientRect()?.height;

        const searchBarHeight: number =
          wrapperElemRef.current.getBoundingClientRect()?.height -
          containerHeight;

        const height: number = event.clientY - searchBarHeight;

        const flex: number = height / containerHeight;
        if (chartElemRef.current && tableElemRef.current) {
          chartElemRef.current.style.flex = `${flex} 1 0`;
          tableElemRef.current.style.flex = `${1 - flex} 1 0`;
        }
      }
    });
  }, []);

  const endResize = React.useCallback(() => {
    document.removeEventListener('mousemove', startResize);
  }, []);

  const toggleDisplayOutliers = React.useCallback(() => {
    setDisplayOutliers(!displayOutliers);
  }, [displayOutliers]);

  React.useEffect(() => {
    metricsCollectionModel.initialize();
    metricsRequestRef.call();

    // tableRef.current?.updateData({
    //   newData: metricsCollectionModel.getDataAsTableRows(xValue)[0],
    // });
    return () => {
      metricsRequestRef.abort();
      document.removeEventListener('mousemove', startResize);
      document.removeEventListener('mouseup', endResize);
    };
  }, []);

  return (
    <Metrics
      tableRef={tableRef}
      displayOutliers={displayOutliers}
      toggleDisplayOutliers={toggleDisplayOutliers}
      handleResize={handleResize}
      tableElemRef={tableElemRef}
      chartElemRef={chartElemRef}
      wrapperElemRef={wrapperElemRef}
      metricsCollection={metricsData?.collection}
      lineChartData={metricsCollectionModel.getDataAsLines()}
      tableData={metricsCollectionModel.getDataAsTableRows()}
      tableColumns={getTableColumns()}
    />
  );
}

export default MetricsContainer;
