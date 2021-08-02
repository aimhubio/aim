import React from 'react';
import useStyles from './highPlotStyle';
//delete before commit
import { mockData } from './helper';

import {
  drawParallelArea,
  clearArea,
  drawParallelAxes,
  drawParallelLines,
  drawParallelHoverAttributes,
  drawParallelAxesBrush,
} from 'utils/d3';
import useResizeObserver from 'hooks/window/useResizeObserver';
import { IHighPlotProps } from 'types/components/HighPlot/HighPlot';
import './highPlot.scss';

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

    drawParallelAxes({
      axesNodeRef,
      visBoxRef,
      attributesRef,
      axesRef,
      dimensions: mockData.dimensions,
    });

    drawParallelLines({
      linesNodeRef,
      attributesRef,
      attributesNodeRef,
      linesRef,
      dimensions: mockData.dimensions,
      data: mockData.data,
    });

    linesRef.current.data = mockData.data;

    drawParallelHoverAttributes({
      dimensions: mockData.dimensions,
      index,
      visAreaRef,
      linesRef,
      attributesRef,
      visBoxRef,
      closestCircleRef,
      attributesNodeRef,
      linesNodeRef,
      highlightedNodeRef,
      highlightMode: 0,
    });
    drawParallelAxesBrush({
      plotBoxRef,
      plotNodeRef,
      brushRef,
      linesRef,
      attributesRef,
      dimensions: mockData.dimensions,
      data: mockData.data,
    });
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
    <div ref={parentRef} className={`${classes.chart} HighPlot__container`}>
      <div ref={visAreaRef} />
    </div>
  );
};

export default HighPlot;
