import * as d3 from 'd3';
import moment from 'moment';
import { isEqual } from 'lodash-es';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import {
  IActivePoint,
  IAxisLineData,
  IDrawHoverAttributesArgs,
  INearestCircle,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import { IAxisScale } from 'types/utils/d3/getAxisScale';
import { IUpdateFocusedChartArgs } from 'types/components/LineChart/LineChart';

import { AggregationAreaMethods } from 'utils/aggregateGroupData';
import getFormattedValue from 'utils/formattedValue';
import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';

import { getDimensionValue } from './getDimensionValue';

import { AlignmentOptionsEnum, CircleEnum, ScaleEnum } from './index';

import 'components/LineChart/LineChart.scss';

function drawHoverAttributes(args: IDrawHoverAttributesArgs): void {
  const {
    data,
    index,
    axesScaleType,
    alignmentConfig,
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
    highlightMode = HighlightEnum.Off,
    syncHoverState,
    aggregationConfig,
    humanizerConfigRef,
    drawAxisLines = {
      x: true,
      y: true,
    },
    drawAxisLabels = {
      x: true,
      y: true,
    },
  } = args;

  if (!svgNodeRef?.current || !bgRectNodeRef?.current) {
    return;
  }

  const chartRect: DOMRect = visAreaRef.current?.getBoundingClientRect() || {};
  let rafID = 0;

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
    mouseX: number,
    mouseY: number,
    nearestCircles: INearestCircle[],
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
    // Closest xValue for mouseX
    const xValue = getInvertedValue(
      axesScaleType.xAxis,
      mouseX,
      attributesRef.current.xScale,
    );

    const nearestCircles: INearestCircle[] = [];
    for (const line of data) {
      let index = 0;
      if (axesScaleType.xAxis !== ScaleEnum.Point) {
        index = d3.bisectCenter(line.data.xValues, xValue as number);
      }
      const xValueByIndex = line.data.xValues[index];
      const yValueByIndex = line.data.yValues[index];
      if (xValueByIndex !== '-' && yValueByIndex !== '-') {
        const closestXPos = attributesRef.current.xScale(xValueByIndex);
        const closestYPos = attributesRef.current.yScale(yValueByIndex);
        const circle = {
          key: line.key,
          color: line.color,
          x: closestXPos,
          y: closestYPos,
        };
        nearestCircles.push(circle);
      } else {
        safeSyncHoverState({ activePoint: null });
      }
    }

    return nearestCircles;
  }

  function clearXAxisLabel(): void {
    if (xAxisLabelNodeRef?.current) {
      xAxisLabelNodeRef.current.remove();
      xAxisLabelNodeRef.current = null;
    }
  }

  function drawXAxisLabel(x: number): void {
    if (xAxisLabelNodeRef && drawAxisLabels.x) {
      const visArea = d3.select(visAreaRef.current);

      const xAxisTickValue = getInvertedValue(
        axesScaleType.xAxis,
        x,
        attributesRef.current.xScale,
      );

      let xAxisValueText = xAxisTickValue;

      if (typeof xAxisTickValue === 'number') {
        switch (alignmentConfig?.type) {
          case AlignmentOptionsEnum.EPOCH:
            xAxisValueText = Math.floor(xAxisTickValue);
            break;
          case AlignmentOptionsEnum.RELATIVE_TIME:
            xAxisValueText = shortEnglishHumanizer(Math.round(xAxisTickValue), {
              ...humanizerConfigRef.current,
              maxDecimalPoints: 2,
            });
            break;
          case AlignmentOptionsEnum.ABSOLUTE_TIME:
            xAxisValueText =
              moment(xAxisTickValue).format('HH:mm:ss D MMM, YY');
            break;
          default:
            xAxisValueText = xAxisTickValue;
        }
      }

      if (xAxisTickValue || xAxisTickValue === 0) {
        clearXAxisLabel();
        // X Axis Label
        xAxisLabelNodeRef.current = visArea
          .append('div')
          .attr('class', 'ChartMouseValue ChartMouseValueXAxis')
          .style('top', `${height - margin.bottom + 1}px`)
          .text(xAxisValueText);

        const axisLeftEdge = margin.left - 1;
        const axisRightEdge = width - margin.right + 1;
        let xAxisValueWidth =
          xAxisLabelNodeRef.current?.node()?.offsetWidth ?? 0;
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
  }

  function clearYAxisLabel(): void {
    if (yAxisLabelNodeRef?.current) {
      yAxisLabelNodeRef.current.remove();
      yAxisLabelNodeRef.current = null;
    }
  }

  function drawYAxisLabel(y: number): void {
    if (yAxisLabelNodeRef && drawAxisLabels.y) {
      const visArea = d3.select(visAreaRef.current);
      const yAxisTickValue = getInvertedValue(
        axesScaleType.yAxis,
        y,
        attributesRef.current.yScale,
        true,
      );

      if (yAxisTickValue || yAxisTickValue === 0) {
        clearYAxisLabel();
        // Y Axis Label
        yAxisLabelNodeRef.current = visArea
          .append('div')
          .attr('class', 'ChartMouseValue ChartMouseValueYAxis')
          .attr('title', yAxisTickValue)
          .style('max-width', `${margin.left - 5}px`)
          .style('right', `${width - margin.left}px`)
          .text(yAxisTickValue);

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
          const groupKey = newActiveLine.attr('groupKey');
          drawActiveArea(groupKey);
        }
      }

      attributesRef.current.lineKey = key;
      attributesRef.current.dataSelector = dataSelector;
    }
  }

  function drawActiveArea(groupKey: string): void {
    linesNodeRef.current
      .select(`[id=AggrArea-${attributesRef.current.groupKey}]`)
      .classed('highlighted', false);

    linesNodeRef.current
      .select(`[id=AggrArea-${groupKey}]`)
      .classed('highlighted', true)
      .raise();

    attributesRef.current.groupKey = groupKey;
  }

  function clearVerticalAxisLine(): void {
    attributesNodeRef.current.select('#HoverLine-y').remove();
  }

  function drawVerticalAxisLine(x: number): void {
    if (drawAxisLines.y) {
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
  }

  function clearHorizontalAxisLine(): void {
    attributesNodeRef.current.select('#HoverLine-x').remove();
  }

  function drawHorizontalAxisLine(y: number): void {
    if (drawAxisLines.x) {
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
      .attr('class', 'HoverCircle')
      .attr('id', (circle: INearestCircle) => `Circle-${circle.key}`)
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
    boundedX: number;
    boundedY: number;
  } {
    const [yMax, yMin] = attributesRef.current.yScale.range();
    const [xMin, xMax] = attributesRef.current.xScale.range();

    return {
      boundedY: yPos > yMax ? yMax : yPos < yMin ? yMin : yPos,
      boundedX: xPos > xMax ? xMax : xPos < xMin ? xMin : xPos,
    };
  }

  function getInvertedValue(
    scaleType: ScaleEnum,
    pos: number,
    axisScale: IAxisScale,
    reverse: boolean = false, // need to reverse domain for inverting Y axis value
  ): number | string {
    if (scaleType === ScaleEnum.Point) {
      return getDimensionValue({
        pos,
        domainData: reverse ? axisScale.domain().reverse() : axisScale.domain(),
        axisScale,
      });
    } else {
      return getFormattedValue(axisScale.invert(pos));
    }
  }

  function getActivePoint(circle: INearestCircle): IActivePoint {
    const xPos = circle.x;
    const yPos = circle.y;
    const { boundedX, boundedY } = getBoundedPosition(xPos, yPos);

    const xValue: number | string = getInvertedValue(
      axesScaleType.xAxis,
      xPos,
      attributesRef.current.xScale,
    );
    const yValue: number | string = getInvertedValue(
      axesScaleType.yAxis,
      yPos,
      attributesRef.current.yScale,
      true,
    );

    return {
      key: circle.key,
      xValue,
      yValue,
      xPos,
      yPos,
      chartIndex: index,
      pointRect: {
        top: chartRect.top + margin.top + boundedY - CircleEnum.ActiveRadius,
        bottom: chartRect.top + margin.top + boundedY + CircleEnum.ActiveRadius,
        left: chartRect.left + margin.left + boundedX - CircleEnum.ActiveRadius,
        right:
          chartRect.left + margin.left + boundedX + CircleEnum.ActiveRadius,
      },
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

    attributesRef.current.xStep = getInvertedValue(
      axesScaleType.xAxis,
      mouseX,
      attributesRef.current.xScale,
    );
    attributesRef.current.dataSelector = dataSelector;
    attributesRef.current.nearestCircles = nearestCircles;
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
      circle.y !== attributesRef.current.activePoint?.yPos ||
      !isEqual(attributesRef.current.nearestCircles, nearestCircles)
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
    attributesRef.current.nearestCircles = nearestCircles;
    return activePoint;
  }

  function updateFocusedChart(args: IUpdateFocusedChartArgs = {}): void {
    const {
      mousePos,
      focusedStateActive = attributesRef.current.focusedState?.active || false,
      force = false,
    } = args;
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

      const nearestCircles = getNearestCircles(mouseX);
      const closestCircle = getClosestCircle(mouseX, mouseY, nearestCircles);
      if (closestCircle) {
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

      attributesRef.current.xStep = getInvertedValue(
        axesScaleType.xAxis,
        mouseX,
        attributesRef.current.xScale,
      );
    }
  }

  function setActiveLineAndCircle(
    lineKey: string,
    focusedStateActive: boolean = false,
    force: boolean = false,
  ): void {
    if (attributesRef.current.xStep || attributesRef.current.xStep === 0) {
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
  function safeSyncHoverState(args: ISyncHoverStateArgs): void {
    if (typeof syncHoverState === 'function') {
      syncHoverState(args);
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
      rafID = window.requestAnimationFrame(() => {
        updateFocusedChart({
          mousePos: [
            Math.floor(mousePos[0]) - margin.left,
            Math.floor(mousePos[1]) - margin.top,
          ],
          focusedStateActive: false,
        });
      });
    }
  }

  function handleMouseLeave(event: MouseEvent): void {
    if (attributesRef.current.focusedState?.active) {
      return;
    }
    const mousePos = d3.pointer(event);

    if (!isMouseInVisArea(mousePos[0], mousePos[1])) {
      if (rafID) {
        window.cancelAnimationFrame(rafID);
      }
      clearHoverAttributes();
      safeSyncHoverState({ activePoint: null });
    }
  }

  function updateScales(xScale: IAxisScale, yScale: IAxisScale) {
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

  if (attributesRef.current.focusedState) {
    updateFocusedChart({ force: true });
  }
}
export default drawHoverAttributes;
