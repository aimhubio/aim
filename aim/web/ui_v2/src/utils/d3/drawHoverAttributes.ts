import * as d3 from 'd3';

import {
  IDrawHoverAttributesProps,
  IGetCoordinates,
  IGetCoordinatesProps,
  IAxisLineData,
  INearestCircle,
  ISetAxisLabelProps,
  IGetNearestCirclesProps,
  IGetNearestCircles,
} from 'types/utils/d3/drawHoverAttributes';
import { CircleEnum, XAlignmentEnum } from './index';
import { IGetAxesScale } from 'types/utils/d3/getAxesScale';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

import 'components/LineChart/LineChart.css';
import getFormattedValue from '../formattedValue';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    data,
    index,
    xAlignment,
    attributesNodeRef,
    attributesRef,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    svgNodeRef,
    bgRectNodeRef,
    closestCircleRef,
    activeLineKeyRef,
    xAxisLabelNodeRef,
    yAxisLabelNodeRef,
    linesNodeRef,
    highlightedNodeRef,
    highlightMode,
    onMouseOver,
    onMouseLeave,
    hasFocusedCircleRef,
  } = props;

  const { top: chartTop, left: chartLeft }: { top: number; left: number } =
    visAreaRef.current.getBoundingClientRect();

  const { margin, width, height } = visBoxRef.current;

  function isMouseInVisArea(mouse: [number, number]): boolean {
    const padding = 5;
    return (
      mouse[0] > margin.left - padding &&
      mouse[0] < width - margin.right + padding &&
      mouse[1] > margin.top - padding &&
      mouse[1] < height - margin.bottom + padding
    );
  }

  function getNearestCircles({
    xScale,
    yScale,
    mouseX,
    mouseY,
  }: IGetNearestCirclesProps): IGetNearestCircles {
    // Closest xPoint for mouseX
    const xPoint = xScale.invert(mouseX);
    let closestCircles: INearestCircle[] = [
      {
        key: '',
        color: '',
        r: undefined,
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
      const circle = {
        key: line.key,
        color: line.color,
        r,
        x: closestXPixel,
        y: closestYPixel,
      };
      nearestCircles.push(circle);

      if (closestCircles[0].r === undefined || r <= closestCircles[0].r) {
        if (r === closestCircles[0].r) {
          // Circle coordinates can be equal, to show only one circle on hover
          // we need to keep array of closest circles
          closestCircles.push(circle);
        } else {
          closestCircles = [circle];
        }
      }
    }
    closestCircles.sort((a, b) => (a.key > b.key ? 1 : -1));
    return { nearestCircles, closestCircle: closestCircles[0] };
  }

  function getCoordinates({
    mouse,
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

  function setAxisLabel({ closestCircle, xScale, yScale }: ISetAxisLabelProps) {
    const visArea = d3.select(visAreaRef.current);
    const xAxisTickValue = xScale.invert(closestCircle.x);
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
    // X Axis Label
    if (xAxisTickValue || xAxisTickValue === 0) {
      if (xAxisLabelNodeRef.current) {
        xAxisLabelNodeRef.current.remove();
        xAxisLabelNodeRef.current = null;
      }
      const formattedValue = getFormattedValue(xAxisTickValue);
      xAxisLabelNodeRef.current = visArea
        .append('div')
        .attr('class', 'ChartMouseValue ChartMouseValueXAxis')
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
    // Y Axis Label
    const yAxisTickValue = yScale.invert(closestCircle.y);
    if (yAxisTickValue || yAxisTickValue === 0) {
      if (yAxisLabelNodeRef.current) {
        yAxisLabelNodeRef.current.remove();
        yAxisLabelNodeRef.current = null;
      }
      const formattedValue = getFormattedValue(yAxisTickValue);
      yAxisLabelNodeRef.current = visArea
        .append('div')
        .attr('class', 'ChartMouseValue ChartMouseValueYAxis')
        .attr('title', formattedValue)
        .style('max-width', `${margin.left - 5}px`)
        .style('right', `${width - margin.left}px`)
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

  function closestCircleChange(
    circle: INearestCircle,
    nearestCircles: INearestCircle[],
  ) {
    // hover Line Changed case
    if (circle.key !== closestCircleRef.current?.key) {
      drawHoverLineChange(activeLineKeyRef.current, circle.key);
    }
    // hover Circle Changed case
    if (
      circle.key !== closestCircleRef.current?.key ||
      circle.x !== closestCircleRef.current?.x ||
      circle.y !== closestCircleRef.current?.y
    ) {
      drawHoverCircleChange(circle, nearestCircles);
    }

    closestCircleRef.current = circle;

    attributesRef.current.x = circle.x + margin.left;
    attributesRef.current.y = circle.y + margin.top;
  }

  function drawHoverLineChange(
    prevLineKey: string | undefined,
    lineKey: string,
  ) {
    linesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );
    // previous line
    if (prevLineKey) {
      linesNodeRef.current
        .select(`[id=Line-${prevLineKey}]`)
        .classed('active', false);
      highlightedNodeRef.current.classed('highlighted', false);
    }
    // new line
    const newActiveLine = linesNodeRef.current.select(`[id=Line-${lineKey}]`);

    if (!newActiveLine.empty()) {
      // get lines data selector
      const linesSelectorToHighlight = newActiveLine.attr('data-selector');
      // set highlighted lines
      highlightedNodeRef.current = linesNodeRef.current
        .selectAll(`[data-selector=${linesSelectorToHighlight}]`)
        .classed('highlighted', true)
        .raise();
      // set active line
      newActiveLine.classed('active', true).raise();

      activeLineKeyRef.current = lineKey;
    }
  }

  function drawHoverCircleChange(
    circle: INearestCircle,
    nearestCircles: INearestCircle[],
  ) {
    const { height, width } = plotBoxRef.current;

    attributesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );

    const boundedHoverLineX =
      circle.x < 0 ? 0 : circle.x > width ? width : circle.x;

    const boundedHoverLineY =
      circle.y < 0 ? 0 : circle.y > height ? height : circle.y;

    const axisLineData: IAxisLineData[] = [
      {
        // hoverLine-y projection
        x1: boundedHoverLineX,
        y1: 0,
        x2: boundedHoverLineX,
        y2: height,
      },
      {
        // hoverLine-x projection
        x1: 0,
        y1: boundedHoverLineY,
        x2: width,
        y2: boundedHoverLineY,
      },
    ];
    // Draw horizontal/vertical lines
    attributesNodeRef.current
      .selectAll('line')
      .data(axisLineData)
      .join('line')
      .attr(
        'id',
        (d: IAxisLineData, i: number) => `HoverLine-${i === 0 ? 'y' : 'x'}`,
      )
      .attr('class', 'HoverLine')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4 2')
      .style('fill', 'none')
      .attr('x1', (axisLine: IAxisLineData) => axisLine.x1)
      .attr('y1', (axisLine: IAxisLineData) => axisLine.y1)
      .attr('x2', (axisLine: IAxisLineData) => axisLine.x2)
      .attr('y2', (axisLine: IAxisLineData) => axisLine.y2)
      .lower();

    // Draw Circles
    attributesNodeRef.current
      .selectAll('circle')
      .data(nearestCircles)
      .join('circle')
      .attr('id', (circle: INearestCircle) => `Circle-${circle.key}`)
      .attr('class', 'HoverCircle')
      .attr('clip-path', 'url(#circles-rect-clip-' + index + ')')
      .attr('cx', (circle: INearestCircle) => circle.x)
      .attr('cy', (circle: INearestCircle) => circle.y)
      .attr('r', CircleEnum.Radius)
      .style('fill', (circle: INearestCircle) => circle.color)
      .on('click', handlePointClick);

    // set active circle
    attributesNodeRef.current
      .select(`[id=Circle-${circle.key}]`)
      .attr('r', CircleEnum.ActiveRadius)
      .classed('active', true)
      .raise();

    setAxisLabel({
      closestCircle: circle,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
    });
  }

  function getActivePointData(circle: INearestCircle) {
    return {
      key: circle.key,
      xValue: getFormattedValue(attributesRef.current.xScale.invert(circle.x)),
      yValue: getFormattedValue(attributesRef.current.yScale.invert(circle.y)),
      pageX: chartLeft + attributesRef.current.x,
      pageY: chartTop + attributesRef.current.y,
    };
  }

  function updateHoverAttributes(mouse: [number, number]) {
    const { mouseX, mouseY } = getCoordinates({
      mouse,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
    });

    const { nearestCircles, closestCircle } = getNearestCircles({
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      mouseX,
      mouseY,
    });

    closestCircleChange(closestCircle, nearestCircles);

    return getActivePointData(closestCircle);
  }

  function setActiveLine(lineKey: string, chartIndex: number) {
    if (index === chartIndex && !hasFocusedCircleRef.current) {
      if (attributesRef.current?.x && attributesRef.current.y) {
        const { mouseX, mouseY } = getCoordinates({
          mouse: [attributesRef.current.x, attributesRef.current.y],
          xScale: attributesRef.current.xScale,
          yScale: attributesRef.current.yScale,
        });

        const { nearestCircles } = getNearestCircles({
          xScale: attributesRef.current.xScale,
          yScale: attributesRef.current.yScale,
          mouseX,
          mouseY,
        });

        const circle = nearestCircles.find(
          (circle: INearestCircle) => circle.key === lineKey,
        );

        if (circle) {
          const mouse: [number, number] = [
            circle.x + margin.left,
            circle.y + margin.top,
          ];

          closestCircleChange(circle, nearestCircles);

          const activePointData = getActivePointData(circle);
          if (typeof onMouseOver === 'function') {
            onMouseOver(index, mouse, activePointData);
          }
        }
      } else {
        drawHoverLineChange(activeLineKeyRef.current, lineKey);
      }
    }
  }

  function clearLinesAndAttributes() {
    linesNodeRef.current.classed('highlight', false);
    attributesNodeRef.current.classed('highlight', false);

    linesNodeRef.current
      .selectAll('path')
      .classed('highlighted', false)
      .classed('active', false);

    attributesNodeRef.current
      .selectAll('circle')
      .attr('r', CircleEnum.Radius)
      .classed('active', false)
      .classed('focus', false);

    attributesNodeRef.current.select('#HoverLine-x').remove();
    if (yAxisLabelNodeRef.current) {
      yAxisLabelNodeRef.current.remove();
      yAxisLabelNodeRef.current = null;
    }
  }

  function handlePointClick(
    this: SVGElement,
    event: MouseEvent,
    circle: INearestCircle,
  ) {
    hasFocusedCircleRef.current = true;

    const mouse: [number, number] = [
      circle.x + margin.left,
      circle.y + margin.top,
    ];
    const activePointData = updateHoverAttributes(mouse);

    if (typeof onMouseOver === 'function') {
      onMouseOver(index, mouse, activePointData);
    }

    bgRectNodeRef.current.on('click', () => {
      hasFocusedCircleRef.current = false;
    });

    linesNodeRef.current.on('click', () => {
      hasFocusedCircleRef.current = false;
    });

    attributesNodeRef.current
      .selectAll('circle')
      .attr('r', CircleEnum.Radius)
      .classed('active', false)
      .classed('focus', false);

    attributesNodeRef.current
      .select(`[id=Circle-${circle.key}]`)
      .classed('focus', true)
      .attr('r', CircleEnum.ActiveRadius)
      .raise();
  }

  function handleMouseMove(event: MouseEvent): void {
    if (hasFocusedCircleRef.current) {
      return;
    }
    const mouse = d3.pointer(event);

    if (isMouseInVisArea(mouse)) {
      const activePointData = updateHoverAttributes(mouse);

      if (typeof onMouseOver === 'function') {
        onMouseOver(index, mouse, activePointData);
      }
    }
  }

  function handleMouseLeave(event: MouseEvent): void {
    if (hasFocusedCircleRef.current) {
      return;
    }
    const mouse = d3.pointer(event);

    if (!isMouseInVisArea(mouse)) {
      clearLinesAndAttributes();

      if (typeof onMouseLeave === 'function') {
        onMouseLeave(index);
      }
    }
  }

  function updateScales(
    xScale: IGetAxesScale['xScale'],
    yScale: IGetAxesScale['yScale'],
  ) {
    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;
  }

  attributesRef.current.updateScales = updateScales;
  attributesRef.current.updateHoverAttributes = updateHoverAttributes;
  attributesRef.current.setActiveLine = setActiveLine;
  attributesRef.current.clearLinesAndAttributes = clearLinesAndAttributes;

  svgNodeRef.current?.on('mousemove', handleMouseMove);
  svgNodeRef.current?.on('mouseleave', handleMouseLeave);
}

export default drawHoverAttributes;
