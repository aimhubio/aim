import * as React from 'react';

import LineChart from 'components/LineChart/LineChart';
import ErrorBoundary from 'components/ErrorBoundary';

import { IBoxContentProps } from 'modules/BaseExplorer/types';

import { ILineChartRef } from 'types/components/LineChart/LineChart';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';

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
    id,
    style,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const chartRef = React.useRef<ILineChartRef>(null);
  const vizStyleRef = React.useRef({
    width: '100%',
    height: '100%',
    padding: 10,
  });

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

  const updateActiveElement = React.useCallback(
    (activePoint: IActivePoint | null) => {
      if (activePoint?.key && activePoint.rect) {
        const boxTop = Number(style?.top) || 0;
        const boxLeft = Number(style?.left) || 0;
        const rect = activePoint.rect;

        engine.activeElement.update({
          key: activePoint.key,
          xValue: activePoint.xValue,
          yValue: activePoint.yValue,
          visId: activePoint.visId,
          inProgress: activePoint.inProgress,
          rect: {
            top: rect.top + vizStyleRef.current.padding + boxTop,
            left: rect.left + vizStyleRef.current.padding + boxLeft,
            bottom: rect.bottom + vizStyleRef.current.padding + boxTop,
            right: rect.right + vizStyleRef.current.padding + boxLeft,
          },
        });
      } else {
        engine.activeElement.reset();
      }
    },
    [style, engine.activeElement],
  );

  const syncHoverState = useSyncHoverState(
    engine,
    chartRef,
    updateActiveElement,
    id,
  );

  const chartTitle = {
    row: `${(data[0]?.groupInfo?.rows?.order || 0) + 1}`,
    column: `${(data[0]?.groupInfo?.columns?.order || 0) + 1}`,
  };

  return chartData?.length ? (
    <ErrorBoundary>
      <div style={vizStyleRef.current}>
        <LineChart
          ref={chartRef}
          id={id}
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
          chartTitle={chartTitle}
          syncHoverState={syncHoverState}
        />
      </div>
    </ErrorBoundary>
  ) : null;
}

Metrics.displayName = 'MetricsBox';

export default React.memo(Metrics);
