import * as d3 from 'd3';

import {
  IDrawHoverAttributesProps,
  IAxisLineData,
  INearestCircle,
  IActivePoint,
  ISyncHoverStateParams,
} from 'types/utils/d3/drawHoverAttributes';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';
import { CircleEnum, XAlignmentEnum } from './index';

import 'components/LineChart/LineChart.scss';
import getFormattedValue from '../formattedValue';
import { IUpdateFocusedChartProps } from 'types/components/LineChart/LineChart';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { AggregationAreaMethods } from '../aggregateGroupData';
import { decode } from '../encoder/encoder';

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
    aggregationConfig,
  } = props;

  const chartRect: DOMRect = visAreaRef.current?.getBoundingClientRect() || {};

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

  function getClosestCircle(mouseX: number, mouseY: number): INearestCircle {
    const nearestCirclesByMouseX: INearestCircle[] = getNearestCircles(mouseX);
    let closestCircles: INearestCircle[] = [];
    let minRadius = null;
    // Find closest circles
    for (let circle of nearestCirclesByMouseX) {
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

  function drawHighlightedLines(dataSelector?: string): void {
    if (dataSelector && highlightMode !== HighlightEnum.Off) {
      highlightedNodeRef.current
        ?.classed('highlighted', false)
        .classed('active', false);

      highlightedNodeRef.current = linesNodeRef.current
        .selectAll(`[data-selector=${dataSelector}]`)
        .classed('highlighted', true)
        .raise();
    }
  }

  function drawActiveLine(key: string): void {
    if (attributesRef.current.lineKey) {
      linesNodeRef.current
        .select(`[id=Line-${attributesRef.current.lineKey}]`)
        .classed('active', false);
    }

    const newActiveLine = linesNodeRef.current.select(`[id=Line-${key}]`);

    if (!newActiveLine.empty()) {
      const dataSelector = newActiveLine.attr('data-selector');
      drawHighlightedLines(dataSelector);

      // set active line
      newActiveLine.classed('active', true).raise();

      if (aggregationConfig?.isApplied) {
        if (aggregationConfig.methods.area !== AggregationAreaMethods.NONE) {
          drawActiveArea(key);
        }
      }

      attributesRef.current.lineKey = key;
      attributesRef.current.dataSelector = dataSelector;
    }
  }

  function drawActiveArea(lineKey: string): void {
    //TODO need to optimize performance
    linesNodeRef.current.selectAll('.AggrArea').each(function (this: any) {
      const area = d3.select(this);
      const areaNode = area.node();
      if (areaNode) {
        const key = areaNode.id.split('AggrArea-')[1];
        const lineKeyArray = decode(key);
        if (lineKeyArray.includes(lineKey)) {
          area.classed('highlighted', true).raise();
        } else {
          area.classed('highlighted', false);
        }
      }
    });
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

  function setLinesHighlightMode(): void {
    linesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );
  }

  function setCirclesHighlightMode(): void {
    attributesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );
  }

  function getBoundedPosition(
    xPos: number,
    yPos: number,
  ): {
    topPos: number;
    leftPos: number;
  } {
    const [yMax, yMin] = attributesRef.current.yScale.range();
    const [xMin, xMax] = attributesRef.current.xScale.range();

    return {
      topPos: yPos > yMax ? yMax : yPos < yMin ? yMin : yPos,
      leftPos: xPos > xMax ? xMax : xPos < xMin ? xMin : xPos,
    };
  }

  function getActivePoint(circle: INearestCircle): IActivePoint {
    const xPos = circle.x;
    const yPos = circle.y;
    const { topPos, leftPos } = getBoundedPosition(xPos, yPos);

    return {
      key: circle.key,
      xValue: getFormattedValue(attributesRef.current.xScale.invert(xPos)),
      yValue: getFormattedValue(attributesRef.current.yScale.invert(yPos)),
      xPos,
      yPos,
      chartIndex: index,
      topPos: chartRect.top + topPos + margin.top,
      leftPos: chartRect.left + leftPos + margin.left,
    };
  }

  function updateHoverAttributes(xValue: number, dataSelector?: string): void {
    const mouseX = attributesRef.current.xScale(xValue);
    const nearestCircles = getNearestCircles(mouseX);

    drawHighlightedLines(dataSelector);

    setLinesHighlightMode();
    setCirclesHighlightMode();

    clearHorizontalAxisLine();
    clearYAxisLabel();

    drawCircles(nearestCircles);
    drawVerticalAxisLine(mouseX);
    drawXAxisLabel(mouseX);

    attributesRef.current.xStep = attributesRef.current.xScale.invert(mouseX);
    attributesRef.current.dataSelector = dataSelector;
  }

  function clearHoverAttributes(): void {
    attributesRef.current.activePoint = undefined;
    attributesRef.current.lineKey = undefined;
    attributesRef.current.dataSelector = undefined;

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

  function drawAttributes(
    circle: INearestCircle,
    nearestCircles: INearestCircle[],
    force: boolean = false,
  ): IActivePoint {
    // hover Line Changed case
    if (force || circle.key !== attributesRef.current.lineKey) {
      setLinesHighlightMode();
      drawActiveLine(circle.key);
    }

    // hover Circle Changed case
    if (
      force ||
      circle.key !== attributesRef.current.activePoint?.key ||
      circle.x !== attributesRef.current.activePoint?.xPos ||
      circle.y !== attributesRef.current.activePoint?.yPos
    ) {
      setCirclesHighlightMode();
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

  function updateFocusedChart(params: IUpdateFocusedChartProps = {}): void {
    const {
      mousePos,
      focusedStateActive = attributesRef.current.focusedState?.active || false,
      force = false,
    } = params;
    const { xScale, yScale, focusedState, activePoint } = attributesRef.current;

    let mousePosition: [number, number] | [] = [];
    if (mousePos) {
      mousePosition = mousePos;
    } else if (focusedState?.active && focusedState.chartIndex === index) {
      mousePosition = [
        xScale(focusedState.xValue),
        yScale(focusedState.yValue),
      ];
    } else if (activePoint?.xValue && activePoint.yValue) {
      mousePosition = [xScale(activePoint.xValue), yScale(activePoint.yValue)];
    }

    if (mousePosition?.length) {
      const [mouseX, mouseY] = mousePosition;

      const closestCircle = getClosestCircle(mouseX, mouseY);
      const nearestCircles = getNearestCircles(closestCircle.x);
      const activePoint = drawAttributes(closestCircle, nearestCircles, force);

      if (focusedStateActive) {
        drawFocusedCircle(activePoint.key);
      }

      safeSyncHoverState({
        activePoint,
        focusedStateActive,
        dataSelector: attributesRef.current.dataSelector,
      });
    } else {
      const xValue = attributesRef.current.xStep ?? xScale.domain()[1];
      const mouseX = attributesRef.current.xScale(xValue);
      const nearestCircles = getNearestCircles(mouseX);

      clearHorizontalAxisLine();
      clearYAxisLabel();

      if (focusedStateActive) {
        setLinesHighlightMode();
        setCirclesHighlightMode();
      }

      drawCircles(nearestCircles);
      drawVerticalAxisLine(mouseX);
      drawXAxisLabel(mouseX);

      attributesRef.current.xStep = attributesRef.current.xScale.invert(mouseX);
    }
  }

  function setActiveLineAndCircle(
    lineKey?: string,
    focusedStateActive: boolean = false,
    force: boolean = false,
  ): void {
    if (!lineKey) {
      safeSyncHoverState({ activePoint: null });
    } else if (
      attributesRef.current.xStep ||
      attributesRef.current.xStep === 0
    ) {
      const mouseX = attributesRef.current.xScale(attributesRef.current.xStep);
      // get nearestCircles depends on previous xStep
      const nearestCirclesByXStep = getNearestCircles(mouseX);
      const closestCircle = nearestCirclesByXStep.find(
        (c) => c.key === lineKey,
      );

      if (closestCircle) {
        safeSyncHoverState({ activePoint: null });

        // get nearestCircles depends on closestCircle.x position
        const nearestCircles = getNearestCircles(closestCircle.x);
        const activePoint = drawAttributes(
          closestCircle,
          nearestCircles,
          force,
        );

        if (focusedStateActive) {
          drawFocusedCircle(activePoint.key);
        }

        safeSyncHoverState({
          activePoint,
          focusedStateActive,
          dataSelector: attributesRef.current.dataSelector,
        });
      }
    }
  }

  // Interactions
  function safeSyncHoverState(params: ISyncHoverStateParams): void {
    if (typeof syncHoverState === 'function') {
      syncHoverState(params);
    }
  }

  function handlePointClick(
    this: SVGElement,
    event: MouseEvent,
    circle: INearestCircle,
  ): void {
    if (attributesRef.current.focusedState?.chartIndex !== index) {
      safeSyncHoverState({ activePoint: null });
    }

    const mousePos: [number, number] = [circle.x, circle.y];
    updateFocusedChart({ mousePos, focusedStateActive: true });
  }

  function handleLeaveFocusedPoint(event: MouseEvent): void {
    if (attributesRef.current.focusedState?.chartIndex !== index) {
      safeSyncHoverState({ activePoint: null });
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

      safeSyncHoverState({ activePoint: null });
    }
  }

  function updateScales(xScale: IGetAxisScale, yScale: IGetAxisScale) {
    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;
  }

  attributesRef.current.updateScales = updateScales;
  attributesRef.current.setActiveLineAndCircle = setActiveLineAndCircle;
  attributesRef.current.updateHoverAttributes = updateHoverAttributes;
  attributesRef.current.updateFocusedChart = updateFocusedChart;
  attributesRef.current.clearHoverAttributes = clearHoverAttributes;

  svgNodeRef.current?.on('mousemove', handleMouseMove);
  svgNodeRef.current?.on('mouseleave', handleMouseLeave);
  bgRectNodeRef.current?.on('click', handleLeaveFocusedPoint);
  linesNodeRef.current?.on('click', handleLeaveFocusedPoint);

  // call on every render
  updateFocusedChart({ force: true });
}
export default drawHoverAttributes;
