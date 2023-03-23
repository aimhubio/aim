import React from 'react';
import _ from 'lodash-es';
import { useResizeObserver } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { RENDER_LINES_OPTIMIZED_LIMIT } from 'config/charts';

import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import { IHighPlotProps } from 'types/components/HighPlot/HighPlot';

import {
  clearArea,
  drawParallelAxes,
  drawParallelLines,
  drawParallelHoverAttributes,
  drawParallelAxesBrush,
  drawParallelColorIndicator,
  drawArea,
} from 'utils/d3';

import './HighPlot.scss';

const HighPlot = React.forwardRef(function HighPlot(
  props: IHighPlotProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    index,
    id = `${index}`,
    nameKey = '',
    curveInterpolation,
    syncHoverState,
    data,
    isVisibleColorIndicator,
    chartTitle,
    onAxisBrushExtentChange,
    brushExtents,
    resizeMode,
    onMount,
    readOnly = false,
    margin = {
      top: 64,
      right: 60,
      bottom: 30,
      left: 60,
    },
  } = props;

  // boxes
  const visBoxRef = React.useRef({
    margin,
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
  const svgNodeRef = React.useRef<any>(null);
  const bgRectNodeRef = React.useRef(null);
  const plotNodeRef = React.useRef<any>(null);
  const axesNodeRef = React.useRef<any>(null);
  const linesNodeRef = React.useRef<any>(null);
  const attributesNodeRef = React.useRef(null);
  const highlightedNodeRef = React.useRef(null);

  // methods and values refs
  const attributesRef = React.useRef<any>({});
  const axesRef = React.useRef<any>({});
  const linesRef = React.useRef<any>({});
  const brushRef = React.useRef<any>({});
  const rafIDRef = React.useRef<number>();

  const updateDeps = [
    data,
    curveInterpolation,
    index,
    isVisibleColorIndicator,
    readOnly,
    resizeMode,
    id,
  ];

  function draw() {
    drawArea({
      index,
      id,
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

    if (isVisibleColorIndicator) {
      drawParallelColorIndicator({ index, plotBoxRef, plotNodeRef });
    }

    drawParallelAxes({
      axesNodeRef,
      visBoxRef,
      attributesRef,
      axesRef,
      dimensions: data.dimensions,
      plotBoxRef,
    });

    if (attributesRef?.current.xScale && attributesRef.current.yScale) {
      drawParallelLines({
        index,
        nameKey,
        linesNodeRef,
        attributesRef,
        attributesNodeRef,
        curveInterpolation,
        isVisibleColorIndicator,
        linesRef,
        dimensions: data.dimensions,
        data: data.data,
      });

      linesRef.current.data = data.data;

      // render lines with low quality if lines count are more than 'RENDER_LINES_OPTIMIZED_LIMIT'
      if (!readOnly && linesNodeRef.current) {
        const linesCount = linesNodeRef.current.selectChildren().size();
        if (linesCount > RENDER_LINES_OPTIMIZED_LIMIT) {
          linesNodeRef.current.classed('optimizeRendering', true);
        }
      }

      if (!readOnly) {
        drawParallelHoverAttributes({
          dimensions: data.dimensions,
          index,
          id,
          nameKey,
          visAreaRef,
          linesRef,
          attributesRef,
          visBoxRef,
          bgRectNodeRef,
          attributesNodeRef,
          linesNodeRef,
          highlightedNodeRef,
          isVisibleColorIndicator,
          axesNodeRef,
          syncHoverState,
          svgNodeRef,
        });
      }
      drawParallelAxesBrush({
        plotBoxRef,
        plotNodeRef,
        brushRef,
        linesRef,
        visBoxRef,
        attributesRef,
        brushExtents,
        onAxisBrushExtentChange,
        dimensions: data.dimensions,
        data: data.data,
        index,
      });
    }
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
    updateDeps,
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
  }, updateDeps);

  React.useEffect(() => {
    if (typeof onMount === 'function') {
      onMount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useImperativeHandle(ref, () => ({
    clearHoverAttributes: () => {
      attributesRef.current.clearHoverAttributes?.();
    },
    setFocusedState: (focusedState: IFocusedState) => {
      const prevFocusState = { ...attributesRef.current.focusedState };
      attributesRef.current.focusedState = {
        ...focusedState,
        visId: focusedState.visId ?? `${focusedState.chartIndex}`,
      };

      if (
        !_.isEmpty(brushExtents) &&
        !_.isNil(focusedState?.yValue) &&
        (focusedState?.active !== prevFocusState?.active ||
          (focusedState?.active &&
            prevFocusState?.active &&
            (prevFocusState.yValue !== focusedState.yValue ||
              prevFocusState.xValue !== focusedState.xValue)))
      ) {
        brushRef?.current?.updateLinesAndHoverAttributes?.({
          mouse: [
            brushRef.current.xScale(focusedState?.xValue),
            (brushRef.current.yScale[focusedState?.xValue ?? 0]?.(
              focusedState?.yValue,
            ) ?? 0) + visBoxRef.current.margin.top,
          ],
          focusedState,
        });
      }
    },
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
  }));

  return (
    <ErrorBoundary>
      <div ref={parentRef} className='HighPlot__container'>
        <div ref={visAreaRef} />
      </div>
    </ErrorBoundary>
  );
});

export default React.memo(HighPlot);
