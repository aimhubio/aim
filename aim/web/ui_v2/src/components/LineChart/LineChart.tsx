import React from 'react';
import * as d3 from 'd3';
import { ILineChartProps } from 'types/components/LineChart/LineChart';

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
import { IHandleBrushChange } from 'types/utils/d3/drawBrush';

import useStyles from './lineChartStyle';

const LineChart = React.forwardRef(function LineChart(
  props: ILineChartProps,
  ref,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    index,
    data,
    axisScaleType = {},
    displayOutliers,
    xAlignment,
    zoomMode,
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
      }),
    [data, displayOutliers],
  );

  const zoomOut = React.useCallback(
    (event) => {
      const { xScale, yScale } = getAxisScale({
        visBoxRef,
        axisScaleType,
        min,
        max,
      });

      // setting axes to initial state
      axesRef.current.updateXAxis(xScale);
      axesRef.current.updateYAxis(yScale);

      // setting scales and lines to initial state
      brushRef.current.updateScales(xScale, yScale);
      attributesRef.current.updateScales(xScale, yScale);
      attributesRef.current.updateHoverAttributes(d3.pointer(event));
      linesNodeRef.current
        .selectAll('.Line')
        .transition()
        .duration(500)
        .attr('d', linesRef.current.lineGenerator(xScale, yScale));
    },
    [axisScaleType, max, min],
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
      axisScaleType,
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
      callback: props.onMouseOver,
    });

    if (zoomMode) {
      brushRef.current.xScale = xScale;
      brushRef.current.yScale = yScale;
      drawBrush({
        brushRef,
        plotBoxRef,
        plotNodeRef,
        handleBrushChange,
      });
      svgNodeRef.current.on('dblclick', zoomOut);
    }
  }, [
    axisScaleType,
    index,
    max,
    min,
    processedData,
    xAlignment,
    zoomMode,
    zoomOut,
  ]);

  const handleBrushChange = ({
    xValues,
    yValues,
    mousePosition,
  }: IHandleBrushChange): void => {
    //
    const { width, height, margin } = visBoxRef.current;

    // updating Scales domain
    brushRef.current.xScale
      .domain(xValues)
      .range([0, width - margin.left - margin.right]);
    brushRef.current.yScale
      .domain(yValues)
      .range([height - margin.top - margin.bottom, 0]);

    // updating axes with new Scales
    axesRef.current.updateXAxis(brushRef.current.xScale);
    axesRef.current.updateYAxis(brushRef.current.yScale);

    attributesRef.current.updateHoverAttributes(mousePosition);

    linesNodeRef.current
      .selectAll('.Line')
      .transition()
      .duration(500)
      .attr(
        'd',
        linesRef.current.lineGenerator(
          brushRef.current.xScale,
          brushRef.current.yScale,
        ),
      );
  };

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

  React.useImperativeHandle(ref, () => ({
    ...axesRef.current,
    ...brushRef.current,
    ...linesRef.current,
    ...attributesRef.current,
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
