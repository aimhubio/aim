import React from 'react';
import { useResizeObserver } from 'hooks';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IAttributesRef } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import {
  clearArea,
  drawArea,
  drawAxes,
  getAxisScale,
  drawHoverAttributes,
  drawScatterTrendline,
  drawPoints,
  drawUnableToRender,
} from 'utils/d3';

import { IScatterPlotProps } from './types.d';

import './styles.scss';

const ScatterPlot = React.forwardRef(function ScatterPlot(
  props: IScatterPlotProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    index = 0,
    nameKey = '',
    data: { dimensions, data },
    syncHoverState,
    chartTitle,
    trendlineOptions,
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
  const linesNodeRef = React.useRef(null);
  const attributesNodeRef = React.useRef(null);
  const highlightedNodeRef = React.useRef(null);

  // methods and values refs
  const axesRef = React.useRef({});
  const linesRef = React.useRef({});
  const attributesRef = React.useRef<IAttributesRef>({});
  const humanizerConfigRef = React.useRef({});
  const rafIDRef = React.useRef<number>();

  const [yDimension, xDimension] = Object.values(dimensions);

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

    const { width, height, margin } = visBoxRef.current;

    const axesScaleType = {
      xAxis: xDimension.scaleType,
      yAxis: yDimension.scaleType,
    };

    const xScale = getAxisScale({
      domainData: xDimension.domainData,
      rangeData: [0, width - margin.left - margin.right],
      scaleType: axesScaleType.xAxis,
    });
    const yScale = getAxisScale({
      domainData: yDimension.domainData,
      rangeData: [height - margin.top - margin.bottom, 0],
      scaleType: axesScaleType.yAxis,
    });

    unableToDrawConditions.unshift({
      condition:
        yDimension.domainData[0] === '-' || xDimension.domainData[0] === '-',
      text: 'Unable to draw points with the current data. Please adjust the data.',
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
      visBoxRef,
      axesScaleType,
      humanizerConfigRef,
      drawBgTickLines: { y: true, x: true },
    });

    drawPoints({
      index,
      data,
      nameKey,
      xScale,
      yScale,
      pointsRef: linesRef,
      pointsNodeRef: linesNodeRef,
    });

    if (!readOnly) {
      drawHoverAttributes({
        index,
        nameKey,
        data,
        axesScaleType,
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
        drawAxisLines: { x: false, y: false },
        drawAxisLabels: { x: false, y: false },
      });
    }

    if (trendlineOptions.isApplied) {
      drawScatterTrendline({
        index,
        nameKey,
        data,
        type: trendlineOptions.type,
        bandwidth: trendlineOptions.bandwidth,
        xScale,
        yScale,
        targetRef: linesNodeRef,
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
    [data, dimensions, trendlineOptions, readOnly, resizeMode],
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
  }, [data, dimensions, trendlineOptions, readOnly]);

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
      <div ref={parentRef} className='ScatterPlot'>
        <div ref={visAreaRef} />
      </div>
    </ErrorBoundary>
  );
});

ScatterPlot.displayName = 'ScatterPlot';

export default React.memo(ScatterPlot);
