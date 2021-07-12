import * as d3 from 'd3';

import {
  IClosestCircle,
  IDrawHoverAttributesProps,
  IGetCoordinates,
  IGetCoordinatesProps,
  IAxisLineData,
  INearestCircle,
  ISetAxisLabelProps,
} from '../../types/utils/d3/drawHoverAttributes';
import classes from '../../components/LineChart/styles.module.css';
import { CircleEnum, XAlignmentEnum } from './index';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    data,
    attributesRef,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    xAxisValueRef,
    yAxisValueRef,
    xScale,
    yScale,
    xAlignment,
  } = props;

  const { margin } = visBoxRef.current;
  const { height, width } = plotBoxRef.current;

  const svgArea = d3.select(visAreaRef.current).select('svg');

  svgArea?.on('mousemove', (event) => {
    const mouse: [number, number] = d3.pointer(event);
    const { mouseX, mouseY } = getCoordinates({
      mouse,
      xScale,
      yScale,
      margin,
    });

    // Closest xPoint for mouseX
    const xPoint = xScale.invert(mouseX);

    // Circle coordinates can be equal, to show only one circle
    // on hover we need to keep array of closest circles
    let closestCircles: IClosestCircle[] = [
      {
        key: '',
        r: null,
        x: 0,
        y: 0,
      },
    ];

    const nearestCircles: INearestCircle[] = [];

    for (const line of data) {
      const index = d3.bisectCenter(line.data.xValues, xPoint);

      const closestXPixel = xScale(line.data.xValues[index]);
      const closestYPixel = yScale(line.data.yValues[index]);

      // Find closest circles
      const rX = Math.abs(closestXPixel - mouseX);
      const rY = Math.abs(closestYPixel - mouseY);
      const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
      if (closestCircles[0].r === null || r <= closestCircles[0].r) {
        const circle = {
          key: line.key,
          r,
          x: closestXPixel,
          y: closestYPixel,
        };
        if (r === closestCircles[0].r) {
          // Circle coordinates can be equal, to show only one circle on hover
          // we need to keep array of closest circles
          closestCircles.push(circle);
        } else {
          closestCircles = [circle];
        }
      }
      nearestCircles.push({
        x: closestXPixel,
        y: closestYPixel,
        key: line.key,
        color: line.color,
      });
    }

    closestCircles.sort((a, b) => (a.key > b.key ? 1 : -1));
    const closestCircle = closestCircles[0];

    // Draw Circles
    attributesRef.current
      .selectAll('circle')
      .data(nearestCircles)
      .join('circle')
      .attr('class', `${classes.HoverCircle}`)
      .attr('id', function (this: SVGElement, circle: INearestCircle) {
        // Set closest circle style
        if (closestCircle.key === circle.key) {
          d3.select(this).classed(classes.active, true).raise();
        }
        return circle.key;
      })
      .attr('cx', (circle: INearestCircle) => circle.x)
      .attr('cy', (circle: INearestCircle) => circle.y)
      .attr('r', (circle: INearestCircle) =>
        closestCircle.key === circle.key
          ? CircleEnum.ActiveRadius
          : CircleEnum.Radius,
      )
      .style('fill', (circle: INearestCircle) => circle.color)
      .on('click', function (this: SVGElement, circle: INearestCircle) {
        // TODO handle click
        // handlePointClick(
        //   closestStep,
        //   trace.runHash,
        //   trace.metricName,
        //   trace.traceContext,
        // );

        d3.select(this)
          .classed(classes.active, false)
          .classed(classes.focus, true);
      });

    // TODO highlight Line
    // linesRef.current.classed();
    // const hoverLine = d3.select(`[id=Line-${closestCircle.key}]`);
    // hoverLine.classed(`${classes.HighlightLine}`, true);

    setAxisLabel({
      closestCircle,
      visAreaRef,
      visBoxRef,
      plotBoxRef,
      xAxisValueRef,
      yAxisValueRef,
      xScale,
      yScale,
      xAlignment,
    });

    const axisLineData: IAxisLineData[] = [
      { x1: closestCircle.x, y1: 0, x2: closestCircle.x, y2: height },
      { x1: 0, y1: closestCircle.y, x2: width, y2: closestCircle.y },
    ];

    // Draw horizontal/vertical lines
    attributesRef.current
      .selectAll('line')
      .data(axisLineData)
      .join('line')
      .attr('class', `${classes.HoverLine}`)
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4 2')
      .style('fill', 'none')
      .lower()
      .attr('x1', (axisLine: IAxisLineData) => axisLine.x1)
      .attr('y1', (axisLine: IAxisLineData) => axisLine.y1)
      .attr('x2', (axisLine: IAxisLineData) => axisLine.x2)
      .attr('y2', (axisLine: IAxisLineData) => axisLine.y2);
  });

  svgArea?.on('mouseleave', (event) => {
    // TODO handle mouseLeave
  });
}

function getCoordinates({
  mouse,
  margin,
  xScale,
  yScale,
}: IGetCoordinatesProps): IGetCoordinates {
  const xPixel = Math.floor(mouse[0]) - margin.left;
  const yPixel = Math.floor(mouse[1]) - margin.top;
  const [xMin, xMax] = xScale.range();
  const [yMax, yMin] = yScale.range();

  return {
    mouseX: xPixel < xMin ? xMin : xPixel > xMax ? xMax : xPixel,
    mouseY: yPixel < yMin ? yMin : yPixel > yMax ? yMax : yPixel,
  };
}

function setAxisLabel({
  closestCircle,
  visAreaRef,
  visBoxRef,
  plotBoxRef,
  xAxisValueRef,
  yAxisValueRef,
  xAlignment,
  xScale,
  yScale,
}: ISetAxisLabelProps) {
  if (xAxisValueRef.current) {
    xAxisValueRef.current.remove();
    xAxisValueRef.current = null;
  }
  if (yAxisValueRef.current) {
    yAxisValueRef.current.remove();
    yAxisValueRef.current = null;
  }

  const xAxisTickValue = xScale.invert(closestCircle.x);
  const yAxisTickValue = yScale.invert(closestCircle.y);

  const xAxisValueLabel = xAxisTickValue;
  const yAxisValueLabel = yAxisTickValue;

  // Set X axis value label related by 'xAlignment'
  // TODO change axis label related by x alignment
  // switch (xAlignment) {
  //   case XAlignmentEnum.Epoch:
  //     break;
  //   case XAlignmentEnum.RelativeTime:
  //     break;
  //   case XAlignmentEnum.AbsoluteTime:
  //     break;
  //   default:
  //     xAxisValueLabel = xAxisTickValue;
  // }

  const { height, width, margin } = visBoxRef.current;
  const visArea = d3.select(visAreaRef.current);

  if (xAxisValueLabel) {
    const formattedValue = Math.round(xAxisValueLabel * 10e9) / 10e9;

    xAxisValueRef.current = visArea
      .append('div')
      .attr(
        'class',
        `${classes.ChartMouseValue} ${classes.ChartMouseValueXAxis}`,
      )
      .style('top', `${height - margin.bottom + 1}px`)
      .text(formattedValue);

    const axisLeftEdge = margin.left - 1;
    const axisRightEdge = width - margin.right + 1;
    let xAxisValueWidth = xAxisValueRef.current.node().offsetWidth;
    if (xAxisValueWidth > plotBoxRef.current.width) {
      xAxisValueWidth = plotBoxRef.current.width;
    }

    xAxisValueRef.current
      .style('width', `${xAxisValueWidth}px`)
      .style(
        'left',
        `${
          closestCircle.x - xAxisValueWidth / 2 < 0
            ? axisLeftEdge + xAxisValueWidth / 2
            : closestCircle.x + axisLeftEdge + xAxisValueWidth / 2 >
              axisRightEdge
            ? axisRightEdge - xAxisValueWidth / 2
            : closestCircle.x + axisLeftEdge
        }px`,
      );
  }

  if (yAxisValueLabel) {
    const formattedValue = Math.round(yAxisTickValue * 10e9) / 10e9;
    yAxisValueRef.current = visArea
      .append('div')
      .attr(
        'class',
        `${classes.ChartMouseValue} ${classes.ChartMouseValueYAxis}`,
      )
      .attr('title', formattedValue)
      .style('max-width', `${margin.left - 5}px`)
      .style('right', `${width - margin.left - 2}px`)
      .text(formattedValue);

    const axisTopEdge = margin.top - 1;
    const axisBottomEdge = height - margin.top;
    const yAxisValueHeight = yAxisValueRef.current.node().offsetHeight;
    yAxisValueRef.current.style(
      'top',
      `${
        closestCircle.y - yAxisValueHeight / 2 < 0
          ? axisTopEdge + yAxisValueHeight / 2
          : closestCircle.y + axisTopEdge + yAxisValueHeight / 2 >
            axisBottomEdge
          ? axisBottomEdge - yAxisValueHeight / 2
          : closestCircle.y + axisTopEdge
      }px`,
    );
  }
}

export default drawHoverAttributes;
