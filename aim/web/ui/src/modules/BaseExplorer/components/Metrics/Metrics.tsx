import * as React from 'react';

import LineChart from 'components/LineChart/LineChart';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

import { ILineChartRef } from 'types/components/LineChart/LineChart';

import {
  useAggregateChartData,
  useSyncHoverState,
  useSetChartData,
  useAlignMetricsData,
  useSmoothChartData,
} from './hooks';

function Metrics(props: IBoxContentProps) {
  const {
    visualizationName,
    engine,
    engine: { useStore },
    data,
    index,
    id,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const chartRef = React.useRef<ILineChartRef>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const ignoreOutliers = useStore(controls.ignoreOutliers.stateSelector);
  const highlighting = useStore(controls.highlighting.stateSelector);
  const zoom = useStore(controls.zoom.stateSelector);

  const [alignedData, axesPropsConfig] = useAlignMetricsData(
    engine,
    vizEngine,
    data,
  );

  const [smoothedData, smoothingConfig] = useSmoothChartData(
    engine,
    vizEngine,
    alignedData,
  );

  const chartData = useSetChartData(smoothedData);

  const [aggregatedData, aggregationConfig] = useAggregateChartData(
    engine,
    vizEngine,
    smoothedData,
    axesPropsConfig.axesScaleType,
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
        index={index}
        nameKey={visualizationName}
        data={chartData}
        highlightMode={highlighting.mode}
        aggregatedData={aggregatedData}
        aggregationConfig={aggregationConfig}
        alignmentConfig={axesPropsConfig.alignment}
        axesScaleRange={axesPropsConfig.axesScaleRange}
        axesScaleType={axesPropsConfig.axesScaleType}
        curveInterpolation={smoothingConfig.curveInterpolation}
        ignoreOutliers={ignoreOutliers.isApplied}
        zoom={zoom}
        onZoomChange={controls.zoom.methods.update}
        chartTitle={{ id: id || '' }}
        syncHoverState={syncHoverState}
      />
    </div>
  ) : null;
}

Metrics.displayName = 'MetricsBox';

export default React.memo(Metrics);
