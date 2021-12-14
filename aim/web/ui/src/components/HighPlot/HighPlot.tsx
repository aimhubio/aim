import React from 'react';

import useResizeObserver from 'hooks/window/useResizeObserver';

import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import { IHighPlotProps } from 'types/components/HighPlot/HighPlot';

import {
  drawParallelArea,
  clearArea,
  drawParallelAxes,
  drawParallelLines,
  drawParallelHoverAttributes,
  drawParallelAxesBrush,
  drawParallelColorIndicator,
} from 'utils/d3';

import './HighPlot.scss';

const HighPlot = React.forwardRef(function HighPlot(
  {
    index,
    curveInterpolation,
    syncHoverState,
    data,
    isVisibleColorIndicator,
    chartTitle,
  }: IHighPlotProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  // containers
  const parentRef = React.useRef<HTMLDivElement>(null);
  const visAreaRef = React.useRef<HTMLDivElement>(null);
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
  // d3 node elements
  const svgNodeRef = React.useRef<any>(null);
  const bgRectNodeRef = React.useRef(null);
  const plotNodeRef = React.useRef(null);
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

  const draw = React.useCallback((): void => {
    drawParallelArea({
      index,
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

      drawParallelHoverAttributes({
        dimensions: data.dimensions,
        index,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curveInterpolation, index, isVisibleColorIndicator, data]);

  React.useImperativeHandle(ref, () => ({
    setActiveLine: (lineKey: string) => {
      attributesRef.current.setActiveLine?.(lineKey);
    },
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

  const renderChart = React.useCallback((): void => {
    clearArea({ visAreaRef });
    draw();
  }, [draw]);

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        rafIDRef.current = window.requestAnimationFrame(renderChart);
      }
    },
    [renderChart],
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
  }, [renderChart]);

  return (
    <div ref={parentRef} className='HighPlot__container'>
      <div ref={visAreaRef} />
    </div>
  );
});

export default React.memo(HighPlot);
