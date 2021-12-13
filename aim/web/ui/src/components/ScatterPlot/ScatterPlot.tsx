import React from 'react';

import useResizeObserver from 'hooks/window/useResizeObserver';

import { IAttributesRef } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import {
  clearArea,
  drawArea,
  drawAxes,
  getAxisScale,
  drawHoverAttributes,
} from 'utils/d3';

import { Text } from '../kit';

import { IScatterPlotProps } from './types.d';

import './styles.scss';

const ScatterPlot = React.forwardRef(function ScatterPlot(
  props: IScatterPlotProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    data: { dimensions, data },
    syncHoverState,
    index = 0,
    chartTitle,
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
  // const linesRef = React.useRef({});
  const attributesRef = React.useRef<IAttributesRef>({});
  const humanizerConfigRef = React.useRef({});
  const rafIDRef = React.useRef<number>();
  const [yDimension, xDimension] = Object.values(dimensions);

  function draw() {
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
      humanizerConfigRef,
      drawBgTickLines: { y: true, x: true },
    });

    // TODO check necessity of drawPoints function
    // drawPoints({
    //   index,
    //   data,
    //   xScale,
    //   yScale,
    //   highlightMode,
    //   pointsRef: linesRef,
    //   pointsNodeRef: linesNodeRef,
    // });

    drawHoverAttributes({
      index,
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
      humanizerConfigRef,
      drawAxisLines: { x: false, y: false },
      drawAxisLabels: { x: false, y: false },
    });
  }

  function renderChart() {
    clearArea({ visAreaRef });
    if (yDimension.domainData[0] === '-' || xDimension.domainData[0] === '-') {
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
    } else {
      draw();
    }
  }

  const resizeObserverCallback: ResizeObserverCallback = React.useCallback(
    (entries: ResizeObserverEntry[]) => {
      if (entries?.length) {
        rafIDRef.current = window.requestAnimationFrame(renderChart);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, dimensions],
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
  }, [data, dimensions]);

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
    <div ref={parentRef} className='ScatterPlot'>
      <div ref={visAreaRef} />
      {yDimension.domainData[0] === '-' || xDimension.domainData[0] === '-' ? (
        <Text className='ScatterPlot__emptyData'> No Data</Text>
      ) : null}
    </div>
  );
});

ScatterPlot.displayName = 'ScatterPlot';

export default React.memo(ScatterPlot);
