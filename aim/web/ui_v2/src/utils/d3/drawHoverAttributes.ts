import * as d3 from 'd3';

import {
  IClosestCircle,
  IDrawHoverAttributesProps,
  IGetCoordinates,
  IGetCoordinatesProps,
  IAxisLineData,
  INearestCircle,
  ISetAxisLabelProps,
  IGetNearestCirclesProps,
  IGetNearestCircles,
  IActivePointData,
} from '../../types/utils/d3/drawHoverAttributes';
import { CircleEnum, XAlignmentEnum } from './index';
import { IGetAxisScale } from 'types/utils/d3/getAxesScale';

import classes from 'components/LineChart/LineChart.module.css';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    data,
    attributesNodeRef,
    attributesRef,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    xAxisLabelNodeRef,
    yAxisLabelNodeRef,
    xAlignment,
    index,
    callback,
  } = props;

  attributesRef.current.updateScales = function (
    xScale: IGetAxisScale['xScale'],
    yScale: IGetAxisScale['yScale'],
  ) {
    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;
  };

  const { margin } = visBoxRef.current;
  const { height, width } = plotBoxRef.current;

  const svgArea = d3.select(visAreaRef.current).select('svg');

  function setActiveCircle(circleKey: string) {
    const { mouseX, mouseY } = getCoordinates({
      mouse: [attributesRef.current.x, attributesRef.current.y],
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      margin,
    });

    const { nearestCircles } = getNearestCircles({
      data,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      mouseX,
      mouseY,
    });

    nearestCircles.forEach((circle: INearestCircle) => {
      if (circle.key !== circleKey) {
        return;
      }
      updateHoverAttributes([circle.x + margin.left, circle.y + margin.top]);
    });
  }

  function updateHoverAttributes(
    mousePosition: [number, number],
  ): IActivePointData {
    const { mouseX, mouseY } = getCoordinates({
      mouse: mousePosition,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      margin,
    });

    const { nearestCircles, closestCircle } = getNearestCircles({
      data,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      mouseX,
      mouseY,
    });

    // Draw Circles
    attributesNodeRef.current
      .selectAll('circle')
      .data(nearestCircles)
      .join('circle')
      .attr('class', `${classes.HoverCircle}`)
      .attr('clip-path', 'url(#circles-rect-clip-' + index + ')')
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
      xAxisLabelNodeRef,
      yAxisLabelNodeRef,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      xAlignment,
    });

    const axisLineData: IAxisLineData[] = [
      { x1: closestCircle.x, y1: 0, x2: closestCircle.x, y2: height },
      { x1: 0, y1: closestCircle.y, x2: width, y2: closestCircle.y },
    ];

    // Draw horizontal/vertical lines
    attributesNodeRef.current
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

    attributesRef.current.x = closestCircle.x + margin.left;
    attributesRef.current.y = closestCircle.y + margin.top;

    return {
      key: closestCircle.key,
      xValue: attributesRef.current.xScale.invert(closestCircle.x),
      yValue: attributesRef.current.yScale.invert(closestCircle.y),
    };
  }

  function handleMouseMove(
    event: MouseEvent | undefined,
    mousePosition?: number[] | any,
  ) {
    let mouse: [number, number];
    if (event) {
      mouse = d3.pointer(event);
    } else {
      mouse = mousePosition;
    }

    const activePointData = updateHoverAttributes(mouse);

    if (typeof callback === 'function') {
      callback(mouse, activePointData);
    }
  }

  attributesRef.current.updateHoverAttributes = updateHoverAttributes;
  attributesRef.current.setActiveCircle = setActiveCircle;

  svgArea?.on('mousemove', handleMouseMove);

  svgArea?.on('mouseleave', (event) => {
    // TODO handle mouseLeave
  });
}

function getNearestCircles({
  data,
  xScale,
  yScale,
  mouseX,
  mouseY,
}: IGetNearestCirclesProps): IGetNearestCircles {
  // Closest xPoint for mouseX
  const xPoint = xScale.invert(mouseX);

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
  return { nearestCircles, closestCircle: closestCircles[0] };
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
  xAxisLabelNodeRef,
  yAxisLabelNodeRef,
  xAlignment,
  xScale,
  yScale,
}: ISetAxisLabelProps) {
  if (xAxisLabelNodeRef.current) {
    xAxisLabelNodeRef.current.remove();
    xAxisLabelNodeRef.current = null;
  }
  if (yAxisLabelNodeRef.current) {
    yAxisLabelNodeRef.current.remove();
    yAxisLabelNodeRef.current = null;
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

    xAxisLabelNodeRef.current = visArea
      .append('div')
      .attr(
        'class',
        `${classes.ChartMouseValue} ${classes.ChartMouseValueXAxis}`,
      )
      .style('top', `${height - margin.bottom + 1}px`)
      .text(formattedValue);

    const axisLeftEdge = margin.left - 1;
    const axisRightEdge = width - margin.right + 1;
    let xAxisValueWidth = xAxisLabelNodeRef.current.node().offsetWidth;
    if (xAxisValueWidth > plotBoxRef.current.width) {
      xAxisValueWidth = plotBoxRef.current.width;
    }

    xAxisLabelNodeRef.current
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
    yAxisLabelNodeRef.current = visArea
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
    const yAxisValueHeight = yAxisLabelNodeRef.current.node().offsetHeight;
    yAxisLabelNodeRef.current.style(
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
