import React from 'react';
import useStyles from './highPlotStyle';

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
import { IHighPlotProps } from 'types/components/HighPlot/HighPlot';

const HighPlot = (
  props: IHighPlotProps,
): React.FunctionComponentElement<React.ReactNode> => {
  const classes = useStyles();
  const { index } = props;
  // containers
  const parentRef = React.useRef<HTMLDivElement>(null);
  const visAreaRef = React.useRef<HTMLDivElement>(null);
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

    // const { xScale, yScale } = getAxisScale({
    //   visBoxRef,
    //   axisScaleType,
    //   min,
    //   max,
    // });

    // attributesRef.current.xScale = xScale;
    // attributesRef.current.yScale = yScale;

    // drawAxes({
    //   axesNodeRef,
    //   axesRef,
    //   plotBoxRef,
    //   xScale,
    //   yScale,
    // });

    // drawLines({
    //   data: processedData,
    //   linesNodeRef,
    //   linesRef,
    //   curveInterpolation,
    //   xScale,
    //   yScale,
    //   index,
    //   highlightMode,
    // });

    // drawHoverAttributes({
    //   data: processedData,
    //   index,
    //   xAlignment,
    //   visAreaRef,
    //   attributesRef,
    //   plotBoxRef,
    //   visBoxRef,
    //   closestCircleRef,
    //   attributesNodeRef,
    //   xAxisLabelNodeRef,
    //   yAxisLabelNodeRef,
    //   linesNodeRef,
    //   highlightedNodeRef,
    //   highlightMode,
    // });

    // if (zoomMode) {
    //   brushRef.current.xScale = xScale;
    //   brushRef.current.yScale = yScale;
    //   drawBrush({
    //     brushRef,
    //     plotBoxRef,
    //     plotNodeRef,
    //     visBoxRef,
    //     axesRef,
    //     attributesRef,
    //     linesRef,
    //     linesNodeRef,
    //     svgNodeRef,
    //     axisScaleType,
    //     min,
    //     max,
    //   });
    // }
  }, [
    // axisScaleType,
    // curveInterpolation,
    index,
    // highlightMode,
    // min,
    // max,
    // processedData,
    // xAlignment,
    // zoomMode,
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
    //   }, [props.data, renderChart, displayOutliers, highlightMode]);
  }, [renderChart]);

  return (
    <div ref={parentRef} className={`${classes.chart}`}>
      <div ref={visAreaRef} />
    </div>
  );
};

export default HighPlot;
