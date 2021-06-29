import React, {
  FunctionComponentElement,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import useStyles from './style';
import { ILineChartProps } from '../../types/components/LineChart/LineChart';
import { useWindowResize } from '../../hooks/useWindowResize';
import { useAnimationFrame } from 'hooks/useAnimationFrame';
import {
  drawArea,
  clearArea,
  drawAxes,
  drawLines,
  processData,
} from '../../utils/d3';

function LineChart(
  props: ILineChartProps,
): FunctionComponentElement<ReactNode> {
  const { width, height } = props;
  const classes = useStyles();

  // Refs
  const visBoxRef = useRef({
    margin: {
      top: 24,
      right: 20,
      bottom: 30,
      left: 60,
    },
    height: null,
    width: null,
  });
  const plotBoxRef = useRef({
    height: null,
    width: null,
  });

  const parentRef = useRef(null);
  const visRef = useRef(null);
  const svgRef = useRef(null);
  const bgRectRef = useRef(null);
  const plotRef = useRef(null);
  const axesRef = useRef(null);
  const linesRef = useRef(null);
  const attributesRef = useRef(null);

  function draw(): void {
    const { index, data, xAlignment, xScaleType, yScaleType, strokeColor } =
      props;

    drawArea({
      index,
      parentRef,
      visRef,
      svgRef,
      bgRectRef,
      visBoxRef,
      plotRef,
      axesRef,
      plotBoxRef,
      linesRef,
      attributesRef,
    });

    const { xMin, yMin, xMax, yMax } = processData({ data });

    const { xScale, yScale } = drawAxes({
      xAlignment,
      xScaleType,
      yScaleType,
      axesRef,
      plotBoxRef,
      visBoxRef,
      xMin,
      xMax,
      yMin,
      yMax,
    });

    drawLines({ data, linesRef, xScale, yScale, strokeColor });
  }

  const renderChart = useCallback(() => {
    clearArea({ visRef });
    draw();
  }, []);

  useWindowResize(useMemo(() => renderChart, [renderChart]));
  useAnimationFrame(useMemo(() => renderChart, [renderChart, width, height]));

  const styles = {
    width,
    height,
  } as React.CSSProperties;

  return (
    <div ref={parentRef} className={classes.lineChart} style={styles}>
      LineChart
      <div ref={visRef} />
    </div>
  );
}

export default React.memo(LineChart);
