import React from 'react';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import useResizeObserver from 'hooks/window/useResizeObserver';

import {
  IAttributesRef,
  IBrushRef,
} from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import {
  clearArea,
  drawArea,
  drawAxes,
  drawBrush,
  drawHoverAttributes,
  getAxisScale,
  processData,
  ScaleEnum,
  drawPoints,
} from 'utils/d3';

import { IScatterPlotProps } from './types.d';

import './styles.scss';

const ScatterPlot = React.forwardRef(function ScatterPlot(
  props: IScatterPlotProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    data,
    zoom,
    onZoomChange,
    syncHoverState,
    index = 0,
    axesScaleType = {
      xAxis: ScaleEnum.Linear,
      yAxis: ScaleEnum.Linear,
    },
    chartTitle,
    displayOutliers = false,
    highlightMode = HighlightEnum.Off,
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
  const linesNodeRef = React.useRef(null);
  const attributesNodeRef = React.useRef(null);
  const highlightedNodeRef = React.useRef(null);

  // methods and values refs
  const axesRef = React.useRef({});
  const brushRef = React.useRef<IBrushRef>({});
  const linesRef = React.useRef({});
  const attributesRef = React.useRef<IAttributesRef>({});
  const humanizerConfigRef = React.useRef({});
  const rafIDRef = React.useRef<number>();

  function draw() {
    const { processedData, min, max, xValues } = processData(
      data,
      displayOutliers,
    );

    drawArea({
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

    const { width, height, margin } = visBoxRef.current;

    const xScale = getAxisScale({
      domainData: [min.x, max.x],
      rangeData: [0, width - margin.left - margin.right],
      scaleType: axesScaleType.xAxis,
    });
    const yScale = getAxisScale({
      domainData: [min.y, max.y],
      rangeData: [height - margin.top - margin.bottom, 0],
      scaleType: axesScaleType.yAxis,
    });

    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;

    drawAxes({
      svgNodeRef,
      axesNodeRef,
      axesRef,
      plotBoxRef,
      xScale,
      yScale,
      width,
      height,
      margin,
      xValues,
      attributesRef,
      humanizerConfigRef,
      drawBgTickLines: { x: true, y: true },
    });

    drawPoints({
      index,
      data: processedData,
      xScale,
      yScale,
      highlightMode,
      pointsRef: linesRef,
      pointsNodeRef: linesNodeRef,
    });

    drawHoverAttributes({
      index,
      data: processedData,
      highlightMode,
      syncHoverState,
      visAreaRef,
      attributesRef,
      plotBoxRef,
      visBoxRef,
      svgNodeRef,
      bgRectNodeRef,
      attributesNodeRef,
      linesNodeRef,
      highlightedNodeRef,
      humanizerConfigRef,
      drawAxisLines: { x: false, y: false },
      drawAxisLabels: { x: false, y: false },
    });

    drawBrush({
      index,
      brushRef,
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
      zoom,
      onZoomChange,
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
    [data, zoom, displayOutliers, highlightMode, axesScaleType],
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
  }, [data, zoom, displayOutliers, highlightMode, axesScaleType]);

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
    <div
      ref={parentRef}
      className={`ScatterPlot ${zoom?.active ? 'zoomMode' : ''}`}
    >
      <div ref={visAreaRef} />
    </div>
  );
});

ScatterPlot.displayName = 'ScatterPlot';

export default React.memo(ScatterPlot);
