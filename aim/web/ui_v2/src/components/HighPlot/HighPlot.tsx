import React from 'react';
import useStyles from './highPlotStyle';

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
import './highPlot.scss';

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
  const classes = useStyles();
  // containers
  const parentRef = React.useRef<HTMLDivElement>(null);
  const visAreaRef = React.useRef<HTMLDivElement>(null);
  // boxes
  const visBoxRef = React.useRef({
    margin: {
      top: 24,
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
  const closestCircleRef = React.useRef(null);
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
      closestCircleRef,
      attributesNodeRef,
      linesNodeRef,
      highlightedNodeRef,
      isVisibleColorIndicator,
      highlightMode: 0,
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
    if (isVisibleColorIndicator) {
      attributesRef.current.mousePosition &&
        attributesRef.current.updateHoverAttributes(
          attributesRef.current.mousePosition,
          true,
        );
    }
  }, [curveInterpolation, index, isVisibleColorIndicator]);

  React.useImperativeHandle(ref, () => ({
    setActiveLine: (lineKey: string) => {
      attributesRef.current.setActiveLine?.(lineKey);
    },
    // updateHoverAttributes: (xValue: number) => {
    //   attributesRef.current.updateHoverAttributes?.(xValue);
    // },
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
    // updateHoverAttributes: (xValue: number) => {
    //   attributesRef.current.updateHoverAttributes?.(xValue);
    // },
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
    //   }, [props.data, renderChart, displayOutliers, highlightMode]);
  }, [renderChart]);

  return (
    <div ref={parentRef} className={`${classes.chart} HighPlot__container`}>
      <div ref={visAreaRef} />
    </div>
  );
});

export default HighPlot;
