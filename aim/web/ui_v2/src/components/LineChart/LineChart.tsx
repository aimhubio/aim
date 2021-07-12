import React from 'react';
import { ILineChartProps } from 'types/components/LineChart/LineChart';

import useStyles from './lineChartStyle';
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

function LineChart(
  props: ILineChartProps,
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

  // d3 elements
  const svgRef = React.useRef<any>(null);
  const brushRef = React.useRef<any>({});
  const bgRectRef = React.useRef(null);
  const plotRef = React.useRef(null);
  const axesRef = React.useRef<any>(null);
  const linesRef = React.useRef<any>(null);
  const attributesRef = React.useRef(null);
  const xAxisValueRef = React.useRef(null);
  const yAxisValueRef = React.useRef(null);

  const { processedData, min, max } = React.useMemo(
    () =>
      processData({
        data,
        displayOutliers,
      }),
    [data, displayOutliers],
  );

  const zoomOut = React.useCallback(() => {
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
    linesRef.current
      .selectAll('.Line')
      .transition()
      .duration(1000)
      .attr('d', linesRef.current.lineGenerator(xScale, yScale));
  }, [axisScaleType, max, min]);

  const draw = React.useCallback((): void => {
    drawArea({
      index,
      visBoxRef,
      plotBoxRef,
      parentRef,
      visAreaRef,
      svgRef,
      bgRectRef,
      plotRef,
      axesRef,
      linesRef,
      attributesRef,
    });
    const { xScale, yScale } = getAxisScale({
      visBoxRef,
      axisScaleType,
      min,
      max,
    });

    drawAxes({
      axesRef,
      plotBoxRef,
      xScale,
      yScale,
    });

    drawLines({
      data: processedData,
      linesRef,
      xScale,
      yScale,
      index,
    });

    drawHoverAttributes({
      data: processedData,
      visAreaRef,
      attributesRef,
      plotBoxRef,
      visBoxRef,
      xAxisValueRef,
      yAxisValueRef,
      xScale,
      yScale,
      xAlignment,
    });

    if (zoomMode) {
      brushRef.current.xScale = xScale;
      brushRef.current.yScale = yScale;
      drawBrush({
        brushRef,
        plotBoxRef,
        plotRef,
        handleBrushChange,
      });
      svgRef.current.on('dblclick', zoomOut);
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

  const handleBrushChange = ({ xValues, yValues }: any): void => {
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

    linesRef.current
      .selectAll('.Line')
      .transition()
      .duration(1000)
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
