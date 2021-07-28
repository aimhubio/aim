import React from 'react';

import {
  drawArea,
  clearArea,
  drawAxes,
  drawLines,
  processData,
  getAxesScale,
  drawBrush,
  drawHoverAttributes,
} from 'utils/d3';
import useResizeObserver from 'hooks/window/useResizeObserver';
import { ILineChartProps } from 'types/components/LineChart/LineChart';

import useStyles from './lineChartStyle';
import { INearestCircle } from '../../types/utils/d3/drawHoverAttributes';

const LineChart = React.forwardRef(function LineChart(
  props: ILineChartProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    data,
    index,
    onMouseOver,
    onMouseLeave,
    hasFocusedCircleRef,
    axesScaleType,
    displayOutliers,
    xAlignment,
    zoomMode,
    highlightMode,
    curveInterpolation,
  } = props;

  const classes = useStyles();
  // boxes
  const visBoxRef = React.useRef({
    margin: {
      top: 24,
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
  const svgNodeRef = React.useRef<any>(null);
  const bgRectNodeRef = React.useRef(null);
  const plotNodeRef = React.useRef(null);
  const axesNodeRef = React.useRef<any>(null);
  const linesNodeRef = React.useRef<any>(null);
  const attributesNodeRef = React.useRef(null);
  const xAxisLabelNodeRef = React.useRef(null);
  const yAxisLabelNodeRef = React.useRef(null);
  const highlightedNodeRef = React.useRef(null);

  // methods and values refs
  const axesRef = React.useRef<any>({});
  const brushRef = React.useRef<any>({});
  const linesRef = React.useRef<any>({});
  const attributesRef = React.useRef<any>({});

  const closestCircleRef = React.useRef<INearestCircle | null>(null);
  const activeLineKeyRef = React.useRef(null);

  function draw() {
    const { processedData, min, max } = processData({
      data,
      displayOutliers,
      axesScaleType,
    });

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
    });

    const { width, height, margin } = visBoxRef.current;
    const xScale = getAxesScale({
      domainData: [min.x, max.x],
      rangeData: [0, width - margin.left - margin.right],
      scaleType: axesScaleType.xAxis,
    });
    const yScale = getAxesScale({
      domainData: [min.y, max.y],
      rangeData: [height - margin.top - margin.bottom, 0],
      scaleType: axesScaleType.yAxis,
    });

    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;

    drawAxes({
      axesNodeRef,
      axesRef,
      plotBoxRef,
      xScale,
      yScale,
    });

    drawLines({
      data: processedData,
      linesNodeRef,
      linesRef,
      curveInterpolation,
      xScale,
      yScale,
      index,
      highlightMode,
    });

    drawHoverAttributes({
      data: processedData,
      index,
      xAlignment,
      visAreaRef,
      attributesRef,
      plotBoxRef,
      visBoxRef,
      svgNodeRef,
      bgRectNodeRef,
      closestCircleRef,
      activeLineKeyRef,
      attributesNodeRef,
      xAxisLabelNodeRef,
      yAxisLabelNodeRef,
      linesNodeRef,
      highlightedNodeRef,
      highlightMode,
      onMouseOver,
      onMouseLeave,
      hasFocusedCircleRef,
      focusedState: props.focusedState,
    });

    if (zoomMode) {
      brushRef.current.xScale = xScale;
      brushRef.current.yScale = yScale;
      drawBrush({
        brushRef,
        plotBoxRef,
        plotNodeRef,
        visBoxRef,
        axesRef,
        attributesRef,
        linesRef,
        linesNodeRef,
        svgNodeRef,
        axesScaleType,
        min,
        max,
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
        // FiXME need to fix later to save focused state on resize
        onMouseLeave(index);
        hasFocusedCircleRef.current = false;
        requestAnimationFrame(renderChart);
      }
    },
    [],
  );

  useResizeObserver(resizeObserverCallback, parentRef);

  React.useEffect(() => {
    requestAnimationFrame(renderChart);
  }, [data, zoomMode, displayOutliers, highlightMode]);

  React.useImperativeHandle(ref, () => ({
    updateHoverAttributes: (mousePosition: [number, number]) => {
      attributesRef.current?.updateHoverAttributes(mousePosition);
    },
    setActiveLine: (lineKey: string, chartIndex: number) => {
      attributesRef.current?.setActiveLine(lineKey, chartIndex);
    },
    clearLinesAndAttributes: () => {
      attributesRef.current?.clearLinesAndAttributes();
    },
  }));

  return (
    <div
      ref={parentRef}
      className={`${classes.chart} ${zoomMode ? 'zoomMode' : ''}`}
    >
      <div ref={visAreaRef} />
    </div>
  );
});

export default React.memo(LineChart);
