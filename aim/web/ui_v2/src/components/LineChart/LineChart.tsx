import React, {
  FunctionComponentElement,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import _ from 'lodash';

import useStyles from './style';
import { ILineChart } from '../../types/components/LineChart/LineChart';
import { useWindowResize } from '../../hooks/useWindowResize';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { drawArea, clearArea, drawAxes, drawLines } from '../../utils/d3';

function LineChart(props: ILineChart): FunctionComponentElement<ReactNode> {
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

  function processData(data: ILineChart['data']) {
    // TODO some data process

    const axisValues = data.map((point) => point[0]);
    const traceValues = data.map((point) => point[1]);

    let xSteps: number[] = [];
    let yValues: number[] = [];

    xSteps = _.uniq(xSteps.concat(axisValues).sort((a, b) => a - b));
    yValues = _.uniq(yValues.concat(traceValues).sort((a, b) => a - b));

    const xNum = xSteps.length;
    const yNum = yValues.length;

    console.log('xSteps', xSteps);
    console.log('yValues', yValues);

    return {
      xMin: xSteps[0],
      xMax: xSteps[xNum - 1],
      yMin: yValues[0],
      yMax: yValues[yNum - 1],
    };
  }

  function draw(): void {
    const { index, data } = props;

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

    const { xMin, yMin, xMax, yMax } = processData(data);

    drawAxes({
      axesRef,
      plotBoxRef,
      visBoxRef,
      xMin,
      xMax,
      yMin,
      yMax,
    });

    drawLines({ data, linesRef, strokeColor: 'red' });
  }

  const renderChart = useCallback(() => {
    clearArea({ visRef });
    draw();
  }, []);

  useWindowResize(useMemo(() => renderChart, [renderChart]));
  useAnimationFrame(
    useMemo(() => renderChart, [renderChart, props.width, props.height]),
  );

  const styles = {
    width: props.width,
    height: props.height,
  } as React.CSSProperties;

  return (
    <div ref={parentRef} className={classes.lineChart} style={styles}>
      LineChart
      <div ref={visRef} />
    </div>
  );
}

export default React.memo(LineChart);
