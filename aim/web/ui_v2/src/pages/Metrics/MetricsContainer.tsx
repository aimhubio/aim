import React from 'react';

import metricsCollectionModel from 'services/models/metrics/metricsCollectionModel';
import useModel from 'hooks/model/useModel';
import Metrics from './Metrics';

const metricsRequestRef = metricsCollectionModel.getMetricsData();

function MetricsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const metricsData = useModel<any>(metricsCollectionModel);

  const tableRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const handleResize = React.useCallback(() => {
    document.addEventListener('mousemove', startResize);
    document.addEventListener('mouseup', endResize);
  }, []);

  const startResize = React.useCallback((event: MouseEvent): void => {
    requestAnimationFrame(() => {
      if (tableRef.current && chartRef.current && wrapperRef.current) {
        const containerHeight: number =
          tableRef.current.getBoundingClientRect()?.height +
          chartRef.current.getBoundingClientRect()?.height;

        const searchBarHeight: number =
          wrapperRef.current.getBoundingClientRect()?.height - containerHeight;

        const height: number = event.clientY - searchBarHeight;

        const flex: number = height / containerHeight;
        if (chartRef.current && tableRef.current) {
          chartRef.current.style.flex = `${flex} 1 0`;
          tableRef.current.style.flex = `${1 - flex} 1 0`;
        }
      }
    });
  }, []);

  const endResize = React.useCallback(() => {
    document.removeEventListener('mousemove', startResize);
  }, []);

  React.useEffect(() => {
    metricsCollectionModel.initialize();
    metricsRequestRef.call();
    return () => {
      metricsRequestRef.abort();
      document.removeEventListener('mousemove', startResize);
      document.removeEventListener('mouseup', endResize);
    };
  }, []);

  return (
    <Metrics
      handleResize={handleResize}
      tableRef={tableRef}
      chartRef={chartRef}
      wrapperRef={wrapperRef}
      metricsCollection={metricsData?.collection}
    />
  );
}

export default MetricsContainer;
