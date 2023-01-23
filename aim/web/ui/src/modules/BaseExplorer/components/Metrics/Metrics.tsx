import * as React from 'react';

import LineChart from 'components/LineChart/LineChart';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

import { ILineChartRef } from 'types/components/LineChart/LineChart';

import { HighlightEnum } from 'utils/d3';

import {
  useAggregateChartData,
  useSyncHoverState,
  useSetChartData,
  useAlignMetricsData,
} from './hooks';

function Metrics(props: IBoxContentProps) {
  const { visualizationName, engine, data, index, id } = props;

  const chartRef = React.useRef<ILineChartRef>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { alignedData, axesPropsConfig } = useAlignMetricsData(
    engine,
    visualizationName,
    data,
  );
  const chartData = useSetChartData(alignedData);

  const [aggregatedData, aggregationConfig] = useAggregateChartData(
    engine,
    visualizationName,
    alignedData,
  );
  const syncHoverState = useSyncHoverState(engine, chartRef, id);

  return chartData?.length ? (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', padding: 10 }}
    >
      <LineChart
        ref={chartRef}
        id={id}
        nameKey={visualizationName}
        index={index}
        data={chartData}
        highlightMode={HighlightEnum.Metric}
        aggregatedData={aggregatedData}
        aggregationConfig={aggregationConfig}
        alignmentConfig={axesPropsConfig.alignment}
        syncHoverState={syncHoverState}
      />
    </div>
  ) : null;
}

Metrics.displayName = 'MetricsBox';

export default React.memo(Metrics);
