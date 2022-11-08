import React from 'react';
import classNames from 'classnames';
import { useResizeObserver } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { RENDER_LINES_OPTIMIZED_LIMIT } from 'config/charts';

import {
  IAttributesRef,
  ILineChartProps,
} from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import {
  drawArea,
  clearArea,
  drawAxes,
  drawLines,
  processLineChartData,
  drawBrush,
  drawHoverAttributes,
  drawUnableToRender,
  CurveEnum,
  HighlightEnum,
} from 'utils/d3';

import './LineChart.scss';

const LineChart = React.forwardRef(function LineChart(
  props: ILineChartProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    data,
    index = 0,
    nameKey = '',
    aggregatedData,
    aggregationConfig,
    syncHoverState,
    axesScaleType,
    axesScaleRange,
    ignoreOutliers = false,
    alignmentConfig,
    highlightMode = HighlightEnum.Off,
    curveInterpolation = CurveEnum.Linear,
    chartTitle,
    zoom,
    onZoomChange,
    readOnly = false,
    resizeMode,
  } = props;

  // boxes
  const visBoxRef = React.useRef({
    margin: {
      top: 30,
      right: 20,
      bottom: 30,
      left: 60,
    },
    height: 0,
    width: 0,
  });
  const plotBoxRef = React.useRef({
    height: 0,
    width: 0,
  });

  // containers
  const parentRef = React.useRef<HTMLDivElement>(null);
  const visAreaRef = React.useRef<HTMLDivElement>(null);

  // d3 node elements
  const svgNodeRef = React.useRef(null);
  const bgRectNodeRef = React.useRef(null);
  const plotNodeRef = React.useRef(null);
  const axesNodeRef = React.useRef(null);
  const linesNodeRef = React.useRef<any>(null);
  const attributesNodeRef = React.useRef(null);
  const xAxisLabelNodeRef = React.useRef(null);
  const yAxisLabelNodeRef = React.useRef(null);
  const highlightedNodeRef = React.useRef(null);

  // methods and values refs
  const axesRef = React.useRef({});
  const linesRef = React.useRef({});
  const attributesRef = React.useRef<IAttributesRef>({});
  const humanizerConfigRef = React.useRef({});
  const rafIDRef = React.useRef<number>();

  const unableToDrawConditions: { condition: boolean; text?: string }[] = [];

  function draw() {
    drawArea({
      index,
      nameKey,
      visBoxRef,
      plotBoxRef,
      parentRef,
      visAreaRef,
      svgNodeRef,
      bgRectNodeRef,
      plotNodeRef,
      axesNodeRef,
      linesNodeRef,
      attributesNodeRef,
      chartTitle,
    });

    const { processedData, processedAggrData, min, max } = processLineChartData(
      {
        data,
        ignoreOutliers,
        visBoxRef,
        axesScaleType,
        axesScaleRange,
        aggregatedData,
        aggregationConfig,
        unableToDrawConditions,
        attributesRef,
      },
    );

    drawAxes({
      svgNodeRef,
      axesNodeRef,
      axesRef,
      plotBoxRef,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      visBoxRef,
      alignmentConfig,
      axesScaleType,
      humanizerConfigRef,
      drawBgTickLines: { y: true, x: false },
    });

    drawLines({
      index,
      processedData,
      nameKey,
      linesNodeRef,
      linesRef,
      curveInterpolation,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      highlightMode,
      aggregationConfig,
      processedAggrData,
      readOnly,
    });

    // render lines with low quality if lines count are more than 'RENDER_LINES_OPTIMIZED_LIMIT'
    if (!readOnly && linesNodeRef.current) {
      const linesCount = linesNodeRef.current.selectChildren().size();
      if (linesCount > RENDER_LINES_OPTIMIZED_LIMIT) {
        linesNodeRef.current.classed('optimizeRendering', true);
      }
    }

    drawBrush({
      index,
      plotBoxRef,
      plotNodeRef,
      visBoxRef,
      axesRef,
      attributesRef,
      linesRef,
      svgNodeRef,
      axesScaleType,
      min,
      max,
      axesScaleRange,
      zoom,
      onZoomChange,
      readOnly,
      unableToDrawConditions,
    });

    if (!readOnly) {
      drawHoverAttributes({
        index,
        nameKey,
        data,
        processedData,
        axesScaleType,
        highlightMode,
        syncHoverState,
        visAreaRef,
        attributesRef,
        plotBoxRef,
        visBoxRef,
        svgNodeRef,
        bgRectNodeRef,
        attributesNodeRef,
        xAxisLabelNodeRef,
        yAxisLabelNodeRef,
        linesNodeRef,
        highlightedNodeRef,
        aggregationConfig,
        alignmentConfig,
      });
    }

    drawUnableToRender({
      renderArr: unableToDrawConditions,
      visAreaRef,
      attributesRef,
      readOnly,
      syncHoverState,
    });
  }

  function renderChart() {
    clearArea({ visAreaRef });
    draw();
  }

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        rafIDRef.current = window.requestAnimationFrame(renderChart);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data,
      zoom,
      ignoreOutliers,
      highlightMode,
      axesScaleType,
      axesScaleRange,
      curveInterpolation,
      aggregationConfig,
      readOnly,
      alignmentConfig,
      resizeMode,
    ],
  );

  const observerReturnCallback = React.useCallback(() => {
    if (rafIDRef.current) {
      window.cancelAnimationFrame(rafIDRef.current);
    }
  }, []);

  useResizeObserver(resizeObserverCallback, parentRef, observerReturnCallback);

  React.useEffect(() => {
    rafIDRef.current = window.requestAnimationFrame(renderChart);
    return () => {
      if (rafIDRef.current) {
        window.cancelAnimationFrame(rafIDRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    zoom,
    ignoreOutliers,
    highlightMode,
    axesScaleType,
    axesScaleRange,
    curveInterpolation,
    aggregationConfig,
    readOnly,
    alignmentConfig,
    resizeMode,
  ]);

  React.useImperativeHandle(ref, () => ({
    setActiveLineAndCircle: (
      lineKey: string,
      focusedStateActive: boolean = false,
      force: boolean = false,
    ) => {
      attributesRef.current.setActiveLineAndCircle?.(
        lineKey,
        focusedStateActive,
        force,
      );
    },
    updateHoverAttributes: (xValue: number, dataSelector?: string) => {
      attributesRef.current.updateHoverAttributes?.(xValue, dataSelector);
    },
    clearHoverAttributes: () => {
      attributesRef.current.clearHoverAttributes?.();
    },
    setFocusedState: (focusedState: IFocusedState) => {
      attributesRef.current.focusedState = focusedState;
    },
  }));

  return (
    <ErrorBoundary>
      <div
        ref={parentRef}
        className={classNames('LineChart', {
          zoomMode: !readOnly && zoom?.active,
        })}
      >
        <div ref={visAreaRef} />
      </div>
    </ErrorBoundary>
  );
});

LineChart.displayName = 'LineChart';

export default React.memo(LineChart);
