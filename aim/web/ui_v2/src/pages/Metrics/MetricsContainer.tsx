import React from 'react';

import useModel from 'hooks/model/useModel';
import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import Metrics from './Metrics';

const projectDataRequest = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const metricsCollectionData = useModel(metricsCollectionModel);

  const tableRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    console.log(metricsCollectionData);
  }, [metricsCollectionData]);

  React.useEffect(() => {
    projectDataRequest.call();
    return () => {
      projectDataRequest.abort();
      document.removeEventListener('mousemove', startResize);
      document.removeEventListener('mouseup', endResize);
    };
  }, []);

  const handleResize = React.useCallback(() => {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }, []);

  const startResize = React.useCallback((event: MouseEvent): void => {
    if (tableRef.current && chartRef.current && wrapperRef.current) {
      const containerHeight: number =
        tableRef.current.getBoundingClientRect()?.height +
        chartRef.current.getBoundingClientRect()?.height;
      const searchBarHeight: number =
        wrapperRef.current.getBoundingClientRect()?.height - containerHeight;
      const height: number = event.clientY - searchBarHeight;
      const flex: number = height / containerHeight;
      requestAnimationFrame(() => {
        if (chartRef.current && tableRef.current) {
          chartRef.current.style.flex = `${flex} 1 0`;
          tableRef.current.style.flex = `${1 - flex} 1 0`;
        }
      });
    }
  }, []);

  const endResize = React.useCallback(() => {
    document.removeEventListener('mousemove', startResize);
  }, []);

  return (
    <Metrics
      handleResize={handleResize}
      tableRef={tableRef}
      chartRef={chartRef}
      wrapperRef={wrapperRef}
    />
  );
}

export default MetricsContainer;
