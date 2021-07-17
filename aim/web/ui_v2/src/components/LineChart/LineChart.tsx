import React from 'react';

import {
  drawArea,
  clearArea,
  drawAxes,
  drawLines,
  processData,
  getAxisScale,
  drawBrush,
  drawHoverAttributes,
} from 'utils/d3';
import useResizeObserver from 'hooks/window/useResizeObserver';
import { ILineChartProps } from 'types/components/LineChart/LineChart';

import useStyles from './lineChartStyle';

function LineChart(
  props: ILineChartProps,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    data,
    index,
    zoomMode,
    xAlignment,
    axesScaleType,
    displayOutliers,
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

  // methods and values refs
  const axesRef = React.useRef<any>({});
  const brushRef = React.useRef<any>({});
  const linesRef = React.useRef<any>({});
  const attributesRef = React.useRef<any>({});

  const { processedData, min, max } = React.useMemo(
    () =>
      processData({
        data,
        displayOutliers,
        axesScaleType,
      }),
    [data, displayOutliers, axesScaleType],
  );

  const draw = React.useCallback((): void => {
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

    const { xScale, yScale } = getAxisScale({
      visBoxRef,
      axesScaleType,
      min,
      max,
    });

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
    });

    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;

    drawHoverAttributes({
      data: processedData,
      visAreaRef,
      attributesRef,
      attributesNodeRef,
      plotBoxRef,
      visBoxRef,
      xAxisLabelNodeRef,
      yAxisLabelNodeRef,
      xAlignment,
      index,
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
  }, [
    axesScaleType,
    curveInterpolation,
    index,
    max,
    min,
    processedData,
    xAlignment,
    zoomMode,
  ]);

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
  }, [props.data, renderChart, zoomMode, displayOutliers]);

  return (
    <div
      ref={parentRef}
      className={`${classes.chart} ${zoomMode ? 'zoomMode' : ''}`}
    >
      <div ref={visAreaRef} />
    </div>
  );
}

export default React.memo(LineChart);
