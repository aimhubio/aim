import React from 'react';

import {
  drawParallelArea,
  clearArea,
  drawParallelAxes,
  drawParallelLines,
  drawParallelHoverAttributes,
  drawParallelAxesBrush,
  drawParallelColorIndicator,
} from 'utils/d3';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import useResizeObserver from 'hooks/window/useResizeObserver';
import { IHighPlotProps } from 'types/components/HighPlot/HighPlot';

import './HighPlot.scss';

const HighPlot = React.forwardRef(function HighPlot(
  {
    index,
    curveInterpolation,
    syncHoverState,
    data,
    isVisibleColorIndicator,
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
    });

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
  }));

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
  }));

  const renderChart = React.useCallback((): void => {
    clearArea({ visAreaRef });
    draw();
  }, [draw]);

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        requestAnimationFrame(renderChart);
      }
    },
    [renderChart],
  );

  useResizeObserver(resizeObserverCallback, parentRef);

  React.useEffect(() => {
    requestAnimationFrame(renderChart);
  }, [renderChart]);

  return (
    <div ref={parentRef} className='HighPlot__container'>
      <div ref={visAreaRef} />
    </div>
  );
});

export default React.memo(HighPlot);
