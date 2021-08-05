import * as d3 from 'd3';

import {
  IDrawHoverAttributesProps,
  IAxisLineData,
  INearestCircle,
  IActivePoint,
} from 'types/utils/d3/drawHoverAttributes';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';
import { CircleEnum, XAlignmentEnum } from './index';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

import 'components/LineChart/LineChart.css';
import getFormattedValue from '../formattedValue';
import { IUpdateFocusedChartProps } from '../../types/components/LineChart/LineChart';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    data,
    index,
    xAlignment,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    svgNodeRef,
    bgRectNodeRef,
    xAxisLabelNodeRef,
    yAxisLabelNodeRef,
    linesNodeRef,
    highlightedNodeRef,
    attributesNodeRef,
    attributesRef,
    highlightMode,
    syncHoverState,
  } = props;

  const { top: chartTop, left: chartLeft }: { top: number; left: number } =
    visAreaRef.current?.getBoundingClientRect() || {};

  const { margin, width, height } = visBoxRef.current;

  function isMouseInVisArea(x: number, y: number): boolean {
    const padding = 5;
    return (
      x > margin.left - padding &&
      x < width - margin.right + padding &&
      y > margin.top - padding &&
      y < height - margin.bottom + padding
    );
  }

  function getClosestCircle(
    nearestCircles: INearestCircle[],
    mouseX: number,
    mouseY: number,
  ): INearestCircle {
    let closestCircles: INearestCircle[] = [];
    let minRadius = null;
    // Find closest circles
    for (let circle of nearestCircles) {
      const rX = Math.abs(circle.x - mouseX);
      const rY = Math.abs(circle.y - mouseY);
      const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
      if (minRadius === null || r <= minRadius) {
        if (r === minRadius) {
          // Circle coordinates can be equal, to show only one circle on hover
          // we need to keep array of closest circles
          closestCircles.push(circle);
        } else {
          minRadius = r;
          closestCircles = [circle];
        }
      }
    }
    closestCircles.sort((a, b) => (a.key > b.key ? 1 : -1));
    return closestCircles[0];
  }

  function getNearestCircles(mouseX: number): INearestCircle[] {
    const { xScale, yScale } = attributesRef.current;
    // Closest xValue for mouseX
    const xValue = xScale.invert(mouseX);

    const nearestCircles: INearestCircle[] = [];
    for (const line of data) {
      const index = d3.bisectCenter(line.data.xValues, xValue);
      const closestXPos = xScale(line.data.xValues[index]);
      const closestYPos = yScale(line.data.yValues[index]);
      const circle = {
        key: line.key,
        color: line.color,
        x: closestXPos,
        y: closestYPos,
      };
      nearestCircles.push(circle);
    }

    return nearestCircles;
  }

  function clearXAxisLabel(): void {
    if (xAxisLabelNodeRef.current) {
      xAxisLabelNodeRef.current.remove();
      xAxisLabelNodeRef.current = null;
    }
  }

  function drawXAxisLabel(x: number): void {
    const visArea = d3.select(visAreaRef.current);
    const xAxisTickValue = attributesRef.current.xScale.invert(x);
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
    if (xAxisTickValue || xAxisTickValue === 0) {
      clearXAxisLabel();
      const formattedValue = getFormattedValue(xAxisTickValue);
      // X Axis Label
      xAxisLabelNodeRef.current = visArea
        .append('div')
        .attr('class', 'ChartMouseValue ChartMouseValueXAxis')
        .style('top', `${height - margin.bottom + 1}px`)
        .text(formattedValue);
      const axisLeftEdge = margin.left - 1;
      const axisRightEdge = width - margin.right + 1;
      let xAxisValueWidth = xAxisLabelNodeRef.current?.node()?.offsetWidth ?? 0;
      if (xAxisValueWidth > plotBoxRef.current.width) {
        xAxisValueWidth = plotBoxRef.current.width;
      }
      xAxisLabelNodeRef.current
        .style('width', `${xAxisValueWidth}px`)
        .style(
          'left',
          `${
            x - xAxisValueWidth / 2 < 0
              ? axisLeftEdge + xAxisValueWidth / 2
              : x + axisLeftEdge + xAxisValueWidth / 2 > axisRightEdge
              ? axisRightEdge - xAxisValueWidth / 2
              : x + axisLeftEdge
          }px`,
        );
    }
  }

  function clearYAxisLabel(): void {
    if (yAxisLabelNodeRef.current) {
      yAxisLabelNodeRef.current.remove();
      yAxisLabelNodeRef.current = null;
    }
  }

  function drawYAxisLabel(y: number): void {
    const visArea = d3.select(visAreaRef.current);
    const yAxisTickValue = attributesRef.current.yScale.invert(y);

    if (yAxisTickValue || yAxisTickValue === 0) {
      clearYAxisLabel();
      const formattedValue = getFormattedValue(yAxisTickValue);
      // Y Axis Label
      yAxisLabelNodeRef.current = visArea
        .append('div')
        .attr('class', 'ChartMouseValue ChartMouseValueYAxis')
        .attr('title', formattedValue)
        .style('max-width', `${margin.left - 5}px`)
        .style('right', `${width - margin.left}px`)
        .text(formattedValue);

      const axisTopEdge = margin.top - 1;
      const axisBottomEdge = height - margin.top;
      const yAxisValueHeight =
        yAxisLabelNodeRef.current?.node()?.offsetHeight ?? 0;

      yAxisLabelNodeRef.current.style(
        'top',
        `${
          y - yAxisValueHeight / 2 < 0
            ? axisTopEdge + yAxisValueHeight / 2
            : y + axisTopEdge + yAxisValueHeight / 2 > axisBottomEdge
            ? axisBottomEdge - yAxisValueHeight / 2
            : y + axisTopEdge
        }px`,
      );
    }
  }

  function clearActiveLine(key?: string): void {
    // previous line
    if (key) {
      linesNodeRef.current.select(`[id=Line-${key}]`).classed('active', false);
      highlightedNodeRef.current?.classed('highlighted', false);
    }
  }

  function drawActiveLine(key: string): void {
    // new line
    const newActiveLine = linesNodeRef.current.select(`[id=Line-${key}]`);

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

      attributesRef.current.lineKey = key;
    }
  }

  function clearVerticalAxisLine(): void {
    attributesNodeRef.current.select('#HoverLine-y').remove();
  }

  function drawVerticalAxisLine(x: number): void {
    const { height, width } = plotBoxRef.current;
    const boundedHoverLineX = x < 0 ? 0 : x > width ? width : x;

    const axisLineData: IAxisLineData = {
      // hoverLine-y projection
      x1: boundedHoverLineX,
      y1: 0,
      x2: boundedHoverLineX,
      y2: height,
    };

    clearVerticalAxisLine();

    // Draw vertical axis line
    attributesNodeRef.current
      .append('line')
      .attr('id', 'HoverLine-y')
      .attr('class', 'HoverLine')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4 2')
      .style('fill', 'none')
      .attr('x1', axisLineData.x1)
      .attr('y1', axisLineData.y1)
      .attr('x2', axisLineData.x2)
      .attr('y2', axisLineData.y2)
      .lower();
  }

  function clearHorizontalAxisLine(): void {
    attributesNodeRef.current.select('#HoverLine-x').remove();
  }

  function drawHorizontalAxisLine(y: number): void {
    const { height, width } = plotBoxRef.current;
    const boundedHoverLineY = y < 0 ? 0 : y > height ? height : y;

    const axisLineData: IAxisLineData = {
      // hoverLine-x projection
      x1: 0,
      y1: boundedHoverLineY,
      x2: width,
      y2: boundedHoverLineY,
    };

    clearHorizontalAxisLine();

    // Draw horizontal axis line
    attributesNodeRef.current
      .append('line')
      .attr('id', 'HoverLine-x')
      .attr('class', 'HoverLine')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4 2')
      .style('fill', 'none')
      .attr('x1', axisLineData.x1)
      .attr('y1', axisLineData.y1)
      .attr('x2', axisLineData.x2)
      .attr('y2', axisLineData.y2)
      .lower();
  }

  function drawActiveCircle(key: string): void {
    attributesNodeRef.current
      .select(`[id=Circle-${key}]`)
      .attr('r', CircleEnum.ActiveRadius)
      .classed('active', true)
      .raise();
  }

  function drawFocusedCircle(key: string): void {
    attributesNodeRef.current
      .selectAll('circle')
      .attr('r', CircleEnum.Radius)
      .classed('active', false)
      .classed('focus', false);

    attributesNodeRef.current
      .select(`[id=Circle-${key}]`)
      .classed('focus', true)
      .attr('r', CircleEnum.ActiveRadius)
      .raise();
  }

  function drawCircles(nearestCircles: INearestCircle[]): void {
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
  }

  function drawLinesHighlightMode(): void {
    linesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );
  }

  function drawCirclesHighlightMode(): void {
    attributesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );
  }

  function getActivePoint(circle: INearestCircle): IActivePoint {
    return {
      key: circle.key,
      xValue: getFormattedValue(attributesRef.current.xScale.invert(circle.x)),
      yValue: getFormattedValue(attributesRef.current.yScale.invert(circle.y)),
      xPos: circle.x,
      yPos: circle.y,
      pageX: chartLeft + circle.x + margin.left,
      pageY: chartTop + circle.y + margin.top,
      chartIndex: index,
    };
  }

  function updateHoverAttributes(xValue: number): void {
    const mouseX = attributesRef.current.xScale(xValue);
    const nearestCircles = getNearestCircles(mouseX);

    drawLinesHighlightMode();
    drawCirclesHighlightMode();

    clearHorizontalAxisLine();
    clearYAxisLabel();

    drawCircles(nearestCircles);
    drawVerticalAxisLine(mouseX);
    drawXAxisLabel(mouseX);

    attributesRef.current.xStep = attributesRef.current.xScale.invert(mouseX);
  }

  function clearHoverAttributes(): void {
    attributesRef.current.activePoint = undefined;
    attributesRef.current.lineKey = undefined;

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

    clearHorizontalAxisLine();
    clearYAxisLabel();
  }

  function drawUpdateAttributes(
    circle: INearestCircle,
    nearestCircles: INearestCircle[],
    force: boolean = false,
  ): IActivePoint {
    // hover Line Changed case
    if (force || circle.key !== attributesRef.current.lineKey) {
      drawLinesHighlightMode();
      clearActiveLine(attributesRef.current.lineKey);
      drawActiveLine(circle.key);
    }

    // hover Circle Changed case
    if (
      force ||
      circle.key !== attributesRef.current.activePoint?.key ||
      circle.x !== attributesRef.current.activePoint?.xPos ||
      circle.y !== attributesRef.current.activePoint?.yPos
    ) {
      drawCirclesHighlightMode();
      drawCircles(nearestCircles);
      drawVerticalAxisLine(circle.x);
      drawHorizontalAxisLine(circle.y);
      drawXAxisLabel(circle.x);
      drawYAxisLabel(circle.y);
      drawActiveCircle(circle.key);
    }

    const activePoint = getActivePoint(circle);
    attributesRef.current.xStep = activePoint.xValue;
    attributesRef.current.activePoint = activePoint;
    return activePoint;
  }

  function updateFocusedChart(props?: IUpdateFocusedChartProps): void {
    const {
      mousePos,
      focusedStateActive = attributesRef.current.focusedState?.active || false,
      force = false,
    } = props || {};
    const { xScale, yScale, focusedState, xStep } = attributesRef.current;

    let mousePosition: [number, number] | [] = [];
    if (mousePos) {
      mousePosition = mousePos;
    } else if (focusedState?.active && focusedState.chartIndex === index) {
      mousePosition = [
        xScale(focusedState.xValue),
        yScale(focusedState.yValue),
      ];
    } else if (
      attributesRef.current.activePoint?.xValue &&
      attributesRef.current.activePoint.yValue
    ) {
      mousePosition = [
        xScale(attributesRef.current.activePoint?.xValue),
        yScale(attributesRef.current.activePoint?.yValue),
      ];
    }

    if (mousePosition?.length) {
      const [mouseX, mouseY] = mousePosition;
      const nearestCircles = getNearestCircles(mouseX);
      const closestCircle = getClosestCircle(nearestCircles, mouseX, mouseY);

      const activePoint = drawUpdateAttributes(
        closestCircle,
        nearestCircles,
        force,
      );

      if (focusedStateActive) {
        drawFocusedCircle(activePoint.key);
      }

      if (typeof syncHoverState === 'function') {
        syncHoverState({
          activePoint,
          focusedStateActive,
        });
      }
    } else {
      const xMax = xScale.range()[1];
      updateHoverAttributes(xStep ?? xMax);
    }
  }

  function setActiveLine(lineKey: string, force: boolean = false): void {
    if (
      attributesRef.current.xStep &&
      attributesRef.current.lineKey !== lineKey
    ) {
      const { xScale, xStep } = attributesRef.current;
      const mouseX = xScale(xStep);
      // TODO remove if no need
      // const [xMin, xMax] = xScale.range();
      // const mouseX = x < xMin ? xMin : x > xMax ? xMax : x;
      const nearestCircles = getNearestCircles(mouseX);
      const closestCircle = nearestCircles.find((c) => c.key === lineKey);

      if (closestCircle) {
        if (typeof syncHoverState === 'function') {
          syncHoverState({ activePoint: null });
        }
        const activePoint = drawUpdateAttributes(
          closestCircle,
          nearestCircles,
          force,
        );
        if (typeof syncHoverState === 'function') {
          syncHoverState({ activePoint });
        }
      }
    }
  }

  // Interactions
  function handlePointClick(
    this: SVGElement,
    event: MouseEvent,
    circle: INearestCircle,
  ): void {
    if (attributesRef.current.focusedState?.chartIndex !== index) {
      if (typeof syncHoverState === 'function') {
        syncHoverState({ activePoint: null });
      }
    }

    const mousePos: [number, number] = [circle.x, circle.y];
    updateFocusedChart({ mousePos, focusedStateActive: true });
  }

  function handleLeaveFocusedPoint(event: MouseEvent): void {
    if (attributesRef.current.focusedState?.chartIndex !== index) {
      if (typeof syncHoverState === 'function') {
        syncHoverState({ activePoint: null });
      }
    }
    const mousePos = d3.pointer(event);

    updateFocusedChart({
      mousePos: [
        Math.floor(mousePos[0]) - margin.left,
        Math.floor(mousePos[1]) - margin.top,
      ],
      force: true,
      focusedStateActive: false,
    });
  }

  function handleMouseMove(event: MouseEvent): void {
    if (attributesRef.current.focusedState?.active) {
      return;
    }
    const mousePos = d3.pointer(event);

    if (isMouseInVisArea(mousePos[0], mousePos[1])) {
      updateFocusedChart({
        mousePos: [
          Math.floor(mousePos[0]) - margin.left,
          Math.floor(mousePos[1]) - margin.top,
        ],
        focusedStateActive: false,
      });
    }
  }

  function handleMouseLeave(event: MouseEvent): void {
    if (attributesRef.current.focusedState?.active) {
      return;
    }
    const mousePos = d3.pointer(event);

    if (!isMouseInVisArea(mousePos[0], mousePos[1])) {
      clearHoverAttributes();

      if (typeof syncHoverState === 'function') {
        syncHoverState({ activePoint: null });
      }
    }
  }

  function updateScales(xScale: IGetAxisScale, yScale: IGetAxisScale) {
    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;
  }

  function init(): void {
    const { focusedState, activePoint, xScale, yScale, xStep } =
      attributesRef.current;

    if (
      focusedState?.chartIndex === index &&
      activePoint?.xValue &&
      activePoint.yValue
    ) {
      const mousePos: [number, number] = [
        xScale(activePoint?.xValue),
        yScale(activePoint?.yValue),
      ];
      if (isMouseInVisArea(mousePos[0], mousePos[1])) {
        updateFocusedChart({ mousePos, force: true });
      }
    } else {
      const xMax = xScale.range()[1];
      updateHoverAttributes(xStep ?? xMax);
    }
  }

  attributesRef.current.updateScales = updateScales;
  attributesRef.current.setActiveLine = setActiveLine;
  attributesRef.current.updateHoverAttributes = updateHoverAttributes;
  attributesRef.current.updateFocusedChart = updateFocusedChart;
  attributesRef.current.clearHoverAttributes = clearHoverAttributes;

  svgNodeRef.current?.on('mousemove', handleMouseMove);
  svgNodeRef.current?.on('mouseleave', handleMouseLeave);
  bgRectNodeRef.current?.on('click', handleLeaveFocusedPoint);
  linesNodeRef.current?.on('click', handleLeaveFocusedPoint);

  // call on every render
  init();
}

export default drawHoverAttributes;
