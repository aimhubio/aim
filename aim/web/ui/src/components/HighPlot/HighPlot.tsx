import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { RENDER_LINES_OPTIMIZED_LIMIT } from 'config/charts';

import useResizeObserver from 'hooks/window/useResizeObserver';

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
    index = 0,
    nameKey = '',
    curveInterpolation,
    syncHoverState,
    data,
    isVisibleColorIndicator,
    chartTitle,
    readOnly = false,
    resizeMode,
  } = props;

  // boxes
  const visBoxRef = React.useRef({
    margin: {
      top: 64,
      right: 60,
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
        });
      }

      drawParallelAxesBrush({
        plotBoxRef,
        plotNodeRef,
        brushRef,
        linesRef,
        attributesRef,
        dimensions: data.dimensions,
        data: data.data,
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
    [
      data,
      curveInterpolation,
      index,
      isVisibleColorIndicator,
      readOnly,
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
    curveInterpolation,
    index,
    isVisibleColorIndicator,
    readOnly,
    resizeMode,
  ]);

  React.useImperativeHandle(ref, () => ({
    clearHoverAttributes: () => {
      attributesRef.current.clearHoverAttributes?.();
    },
    setFocusedState: (focusedState: IFocusedState) => {
      attributesRef.current.focusedState = focusedState;
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
