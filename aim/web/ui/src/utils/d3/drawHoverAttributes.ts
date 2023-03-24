import * as d3 from 'd3';
import _ from 'lodash-es';

import {
  HoverAttrData,
  IActivePoint,
  IAxisLineData,
  IDrawHoverAttributesArgs,
  INearestCircle,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import { IAxisScale } from 'types/utils/d3/getAxisScale';
import { IUpdateFocusedChartArgs } from 'types/components/LineChart/LineChart';
import { IProcessedData } from 'types/utils/d3/processLineChartData';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import { AggregationAreaMethods } from 'utils/aggregateGroupData';
import getRoundedValue from 'utils/roundValue';

import { formatValueByAlignment } from '../formatByAlignment';

import { getDimensionValue } from './getDimensionValue';

import { CircleEnum, HighlightEnum, ScaleEnum } from './index';

function drawHoverAttributes(args: IDrawHoverAttributesArgs): void {
  const {
    index,
    id,
    nameKey,
    data,
    processedData = [],
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
    attributesNodeRef: attrNodeRef,
    attributesRef: attrRef,
    highlightMode = HighlightEnum.Off,
    syncHoverState,
    aggregationConfig,
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
    data: HoverAttrData[],
  ): INearestCircle | null {
    const { scaledValues } = attrRef.current;
    if (!scaledValues) {
      return null;
    }
    // find active point
    let closestCircles: INearestCircle[] = [];
    let minDistance: number = Infinity;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      for (let j = 0; j < scaledValues[i].length; j++) {
        const scaledValue = scaledValues[i][j];
        const rX = Math.abs(scaledValue.x - mouseX);
        const rY = Math.abs(scaledValue.y - mouseY);
        const r = Math.sqrt(rX * rX + rY * rY);
        if (r <= minDistance) {
          const isLastCircle =
            item.data.xValues.length > 0 && j === item.data.xValues.length - 1;
          const circle = {
            key: item.key,
            color: item.color || '#000',
            inProgress: isLastCircle && !!item?.run?.props?.active,
            ...scaledValue,
          };
          if (r === minDistance) {
            // Circle coordinates can be equal
            // To show only one circle on hover we need to keep array of closest circles
            closestCircles.push(circle);
          } else {
            minDistance = r;
            closestCircles = [circle];
          }
        }
      }
    }

    closestCircles.sort((a, b) => (a.key > b.key ? 1 : -1));
    return closestCircles.length ? closestCircles[0] : null;
  }

  function getNearestCircles(mouseX: number): INearestCircle[] {
    const nearestCircles: INearestCircle[] = [];
    // Closest xValue for mouseX
    const xValue = getInvertedValue(
      axesScaleType.xAxis,
      mouseX,
      attrRef.current.xScale,
      false,
    );
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      let index = 0;
      if (axesScaleType.xAxis !== ScaleEnum.Point) {
        index = d3.bisectCenter(
          item.data.xValues as number[],
          xValue as number,
        );
        while (
          index &&
          getRoundedValue((item.data.xValues as number[])[index]) > xValue
        ) {
          index--;
        }
      }
      const x = item.data.xValues[index];
      const y = item.data.yValues[index];
      if ((x || x === 0) && x !== '-' && (y || y === 0) && y !== '-') {
        const isLastCircle =
          item.data.xValues.length > 0 &&
          index === item.data.xValues.length - 1;

        nearestCircles.push({
          key: item.key,
          color: item.color || '#000',
          x: attrRef.current.xScale(x) || 0,
          y: attrRef.current.yScale(y) || 0,
          inProgress: isLastCircle && !!item?.run?.props?.active,
        });
      }
    }
    return nearestCircles;
  }

  function drawXAxisLabel(xValue: string | number): void {
    if (xAxisLabelNodeRef && drawAxisLabels.x) {
      const visArea = d3.select(visAreaRef.current);
      if (visArea?.empty()) return;
      let xAxisValueText = xValue;
      if (typeof xValue === 'number') {
        xAxisValueText = formatValueByAlignment({
          xAxisTickValue: xValue ?? null,
          type: alignmentConfig?.type,
        });
      }
      if (xValue || xValue === 0) {
        // X Axis Label
        const axisLeftEdge = margin.left - 1;
        const axisRightEdge = width - margin.right + 1;
        let xAxisValueWidth =
          xAxisLabelNodeRef.current?.node()?.offsetWidth || 0;
        if (xAxisValueWidth > plotBoxRef.current.width) {
          xAxisValueWidth = plotBoxRef.current.width;
        }

        const x = attrRef.current.xScale(xValue);
        const left =
          x - xAxisValueWidth / 2 < 0
            ? axisLeftEdge + xAxisValueWidth / 2
            : x + axisLeftEdge + xAxisValueWidth / 2 > axisRightEdge
            ? axisRightEdge - xAxisValueWidth / 2
            : x + axisLeftEdge;
        const top = height - margin.bottom + 1;

        if (xAxisLabelNodeRef.current && xAxisValueWidth) {
          // update x-axis label
          xAxisLabelNodeRef.current
            .attr('title', xAxisValueText)
            .style('top', `${top}px`)
            .style('left', `${left}px`)
            .style('min-width', '24px')
            .style('max-width', '150px')
            .text(xAxisValueText);
        } else {
          // create x-axis label
          xAxisLabelNodeRef.current = visArea
            .append('div')
            .attr('class', 'ChartMouseValue ChartMouseValueXAxis')
            .attr('title', xAxisValueText)
            .style('top', `${top}px`)
            .style('left', `${left}px`)
            .style('min-width', '24px')
            .style('max-width', '150px')
            .text(xAxisValueText);
        }
      }
    }
  }

  function clearYAxisLabel(): void {
    if (yAxisLabelNodeRef?.current) {
      yAxisLabelNodeRef.current.remove();
      yAxisLabelNodeRef.current = null;
    }
  }

  function drawYAxisLabel(yValue: string | number): void {
    if (yAxisLabelNodeRef && drawAxisLabels.y) {
      const visArea = d3.select(visAreaRef.current);
      if (visArea?.empty()) return;

      if (yValue || yValue === 0) {
        // Y Axis Label
        const axisTopEdge = margin.top - 1;
        const axisBottomEdge = height - margin.top;
        const yAxisValueHeight =
          yAxisLabelNodeRef.current?.node()?.offsetHeight || 0;
        const y = attrRef.current.yScale(yValue);
        const top =
          y - yAxisValueHeight / 2 < 0
            ? axisTopEdge + yAxisValueHeight / 2
            : y + axisTopEdge + yAxisValueHeight / 2 > axisBottomEdge
            ? axisBottomEdge - yAxisValueHeight / 2
            : y + axisTopEdge;

        const right = width - margin.left;
        const maxWidth = margin.left - 5;

        if (yAxisLabelNodeRef.current && yAxisValueHeight) {
          // update y-axis label
          yAxisLabelNodeRef.current
            .attr('title', yValue)
            .style('top', `${top}px`)
            .style('right', `${right}px`)
            .style('max-width', `${maxWidth}px`)
            .text(yValue);
        } else {
          // create y-axis label
          yAxisLabelNodeRef.current = visArea
            .append('div')
            .attr('class', 'ChartMouseValue ChartMouseValueYAxis')
            .attr('title', yValue)
            .style('top', `${top}px`)
            .style('right', `${right}px`)
            .style('max-width', `${maxWidth}px`)
            .text(yValue);
        }
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
    if (attrRef.current.lineKey) {
      linesNodeRef.current
        .select(`[id=Line-${attrRef.current.lineKey}]`)
        .classed('active', false);
    }

    const newActiveLine = linesNodeRef.current.select(`[id=Line-${key}]`);
    if (!newActiveLine.empty()) {
      const dataSelector = newActiveLine.attr('data-selector');
      drawHighlightedLines(dataSelector);
      // set active line
      newActiveLine.classed('active', true).raise();
      if (aggregationConfig?.isApplied) {
        const groupKey = newActiveLine.attr('groupKey');
        drawActiveAggrLine(groupKey);
        if (aggregationConfig.methods.area !== AggregationAreaMethods.NONE) {
          drawActiveAggrArea(groupKey);
        }
      }

      attrRef.current.lineKey = key;
      attrRef.current.dataSelector = dataSelector;
    }
  }

  function drawActiveAggrLine(
    nextGroupKey: string,
    prevGroupKey = attrRef.current.groupKey,
  ): void {
    if (prevGroupKey) {
      linesNodeRef.current
        .select(`[id=AggrLine-${attrRef.current.groupKey}]`)
        .classed('highlighted', false);
    }
    linesNodeRef.current
      .select(`[id=AggrLine-${nextGroupKey}]`)
      .classed('highlighted', true)
      .raise();
  }

  function drawActiveAggrArea(
    nextGroupKey: string,
    prevGroupKey = attrRef.current.groupKey,
  ): void {
    if (prevGroupKey) {
      linesNodeRef.current
        .select(`[id=AggrArea-${attrRef.current.groupKey}]`)
        .classed('highlighted', false);
    }

    linesNodeRef.current
      .select(`[id=AggrArea-${nextGroupKey}]`)
      .classed('highlighted', true)
      .raise();

    attrRef.current.groupKey = nextGroupKey;
  }

  function drawVerticalAxisLine(x: number): void {
    if (drawAxisLines.y && plotBoxRef.current) {
      const { height, width } = plotBoxRef.current;

      const boundedHoverLineX = x < 0 ? 0 : x > width ? width : x;

      const axisLineData: IAxisLineData = {
        // hoverLine-y projection
        x1: boundedHoverLineX,
        y1: 0,
        x2: boundedHoverLineX,
        y2: height,
      };

      const hoverLineY = attrNodeRef.current.select('#HoverLine-y');

      // Draw vertical axis line
      if (!hoverLineY.empty()) {
        // update vertical hoverLine
        hoverLineY
          .attr('x1', axisLineData.x1.toFixed(2))
          .attr('y1', axisLineData.y1.toFixed(2))
          .attr('x2', axisLineData.x2.toFixed(2))
          .attr('y2', axisLineData.y2.toFixed(2));
      } else {
        // create vertical hoverLine
        attrNodeRef.current
          .append('line')
          .attr('id', 'HoverLine-y')
          .attr('class', 'HoverLine')
          .style('stroke', '#94999f')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '4 2')
          .style('fill', 'none')
          .style('pointer-events', 'none')
          .attr('x1', axisLineData.x1.toFixed(2))
          .attr('y1', axisLineData.y1.toFixed(2))
          .attr('x2', axisLineData.x2.toFixed(2))
          .attr('y2', axisLineData.y2.toFixed(2))
          .lower();
      }
    }
  }

  function clearHorizontalAxisLine(): void {
    attrNodeRef.current.select('#HoverLine-x').remove();
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

      const hoverLineX = attrNodeRef.current.select('#HoverLine-x');

      // Draw horizontal axis line
      if (!hoverLineX.empty()) {
        // update horizontal hoverLine
        hoverLineX
          .attr('x1', axisLineData.x1)
          .attr('y1', axisLineData.y1)
          .attr('x2', axisLineData.x2)
          .attr('y2', axisLineData.y2);
      } else {
        // create horizontal hoverLine
        attrNodeRef.current
          .append('line')
          .attr('id', 'HoverLine-x')
          .attr('class', 'HoverLine')
          .style('stroke', '#94999f')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '4 2')
          .style('fill', 'none')
          .style('pointer-events', 'none')
          .attr('x1', axisLineData.x1)
          .attr('y1', axisLineData.y1)
          .attr('x2', axisLineData.x2)
          .attr('y2', axisLineData.y2)
          .lower();
      }
    }
  }

  function drawActiveCircle(key: string, inProgress: boolean = false): void {
    attrNodeRef.current
      .select(`[id=Circle-${key}]`)
      .attr('r', CircleEnum.ActiveRadius)
      .classed('active', true)
      .classed('inProgressLineIndicator', inProgress)
      .raise();
  }

  function drawFocusedCircle(key: string, inProgress: boolean = false): void {
    attrNodeRef.current
      .selectAll('.HoverCircle')
      .attr('r', CircleEnum.Radius)
      .classed('active', false)
      .classed('focus', false);

    attrNodeRef.current.select('.focus__shadow')?.remove();

    const newFocusedPoint = attrNodeRef.current.select(`[id=Circle-${key}]`);
    newFocusedPoint
      .classed('focus', true)
      .classed('inProgressLineIndicator', inProgress)
      .attr('r', CircleEnum.ActiveRadius)
      .raise();

    attrNodeRef.current
      .append('circle')
      .classed('HoverCircle focus focus__shadow', true)
      .attr('r', CircleEnum.ActiveRadius)
      .attr('cx', newFocusedPoint.attr('cx'))
      .attr('cy', newFocusedPoint.attr('cy'))
      .attr('stroke', newFocusedPoint.attr('stroke'))
      .attr('stroke-opacity', 0.4)
      .lower();
  }

  function drawCircles(nearestCircles: INearestCircle[]): void {
    attrNodeRef.current
      .selectAll('.HoverCircle')
      .data(
        nearestCircles.filter(
          (circle) =>
            !(
              (axesScaleType.xAxis === ScaleEnum.Log && circle.x === 0) ||
              (axesScaleType.yAxis === ScaleEnum.Log && circle.y === 0)
            ),
        ),
      )
      .join('circle')
      .attr('class', 'HoverCircle')
      .attr('id', (d: INearestCircle) => `Circle-${d.key}`)
      .attr('clip-path', `url(#${nameKey}-circles-rect-clip-${id})`)
      .attr('cx', (d: INearestCircle) => d.x.toFixed(2))
      .attr('cy', (d: INearestCircle) => d.y.toFixed(2))
      .attr('r', CircleEnum.Radius)
      .attr('stroke', (d: INearestCircle) => d.color)
      .attr('fill', (d: INearestCircle) => d.color)
      .attr('stroke-opacity', 1)
      .on('click', handlePointClick);

    updateActiveRunsIndicators();
  }

  function drawActiveRunsIndicators(data: IProcessedData[]): void {
    const activeRuns = data?.filter((d) => d?.run?.props?.active) || [];

    attrNodeRef.current
      ?.selectAll('.inProgressLineIndicator')
      .data(activeRuns)
      .join('circle')
      .attr('id', (d: IProcessedData) => `inProgressLineIndicator-${d.key}`)
      .attr('clip-path', `url(#${nameKey}-circles-rect-clip-${id})`)
      .attr('class', 'inProgressLineIndicator')
      .style('stroke', (d: IProcessedData) => d.color)
      .style('fill', (d: IProcessedData) => d.color)
      .attr('cx', (d: IProcessedData) => {
        if (d.data.length > 0) {
          const lastPoint = d.data[d.data.length - 1];
          return attrRef.current.xScale(lastPoint[0]).toFixed(2);
        }
      })
      .attr('cy', (d: IProcessedData) => {
        if (d.data.length > 0) {
          const lastPoint = d.data[d.data.length - 1];
          return attrRef.current.yScale(lastPoint[1]).toFixed(2);
        }
      })
      .attr('r', CircleEnum.InProgress)
      .on('click', handlePointClick);
  }

  function updateActiveRunsIndicators(): void {
    attrNodeRef.current
      ?.selectAll('.inProgressLineIndicator')
      .attr('cx', (d: IProcessedData) => {
        if (d.data?.length > 0) {
          const lastPoint = d.data[d.data.length - 1];
          return attrRef.current.xScale(lastPoint[0]).toFixed(2);
        }
      })
      .attr('cy', (d: IProcessedData) => {
        if (d.data?.length > 0) {
          const lastPoint = d.data[d.data.length - 1];
          return attrRef.current.yScale(lastPoint[1]).toFixed(2);
        }
      })
      .raise();
  }

  function setLinesHighlightMode(): void {
    linesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );
  }

  function setCirclesHighlightMode(): void {
    attrNodeRef.current.classed(
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
    const [yMax, yMin] = attrRef.current.yScale.range();
    const [xMin, xMax] = attrRef.current.xScale.range();

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
    rounded: boolean = true,
  ): number | string {
    if (scaleType === ScaleEnum.Point) {
      return getDimensionValue({
        pos,
        domainData: reverse ? axisScale.domain().reverse() : axisScale.domain(),
        axisScale,
      });
    } else {
      return rounded
        ? getRoundedValue(axisScale.invert(pos))
        : axisScale.invert(pos);
    }
  }

  function getActivePoint(
    circle: INearestCircle,
    xValue: string | number,
    yValue: string | number,
  ): IActivePoint {
    const xPos = circle.x;
    const yPos = circle.y;
    const { boundedX, boundedY } = getBoundedPosition(xPos, yPos);

    const chartRect: DOMRect =
      visAreaRef.current?.getBoundingClientRect() || {};

    const rect = {
      top: +(margin.top + boundedY - CircleEnum.ActiveRadius).toFixed(2),
      bottom: +(margin.top + boundedY + CircleEnum.ActiveRadius).toFixed(2),
      left: +(margin.left + boundedX - CircleEnum.ActiveRadius).toFixed(2),
      right: +(margin.left + boundedX + CircleEnum.ActiveRadius).toFixed(2),
    };
    // @TODO - remove "pointRect" after refactoring (removing old metrics explorer)
    const pointRect = {
      top: +(chartRect.top + rect.top).toFixed(2),
      bottom: +(chartRect.top + rect.bottom).toFixed(2),
      left: +(chartRect.left + rect.left).toFixed(2),
      right: +(chartRect.left + rect.right).toFixed(2),
    };
    return {
      key: circle.key,
      xValue,
      yValue,
      xPos,
      yPos,
      inProgress: !!circle.inProgress,
      chartIndex: index || 0,
      visId: id,
      pointRect,
      rect,
    };
  }

  function updateHoverAttributes(xValue: number, dataSelector?: string): void {
    const mouseX = attrRef.current.xScale(xValue) || 0;
    const nearestCircles = getNearestCircles(mouseX);

    drawHighlightedLines(dataSelector);

    setLinesHighlightMode();
    setCirclesHighlightMode();

    clearHorizontalAxisLine();
    clearYAxisLabel();

    drawVerticalAxisLine(mouseX);
    drawCircles(nearestCircles);

    const newXValue = getInvertedValue(
      axesScaleType.xAxis,
      mouseX,
      attrRef.current.xScale,
    );

    drawXAxisLabel(newXValue);
    attrRef.current.currentXValue = newXValue;
    attrRef.current.dataSelector = dataSelector;
    attrRef.current.nearestCircles = nearestCircles;
  }

  function clearHoverAttributes(): void {
    attrRef.current.activePoint = undefined;
    attrRef.current.lineKey = undefined;
    attrRef.current.dataSelector = undefined;

    linesNodeRef.current.classed('highlight', false);
    attrNodeRef.current.classed('highlight', false);

    linesNodeRef.current
      .selectAll('path')
      .classed('highlighted', false)
      .classed('active', false);

    attrNodeRef.current
      .selectAll('.HoverCircle')
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
    // hover line changed case
    if (force || circle.key !== attrRef.current.lineKey) {
      setLinesHighlightMode();
      drawActiveLine(circle.key);
    }

    const xValue: number | string = getInvertedValue(
      axesScaleType.xAxis,
      circle.x,
      attrRef.current.xScale,
    );
    const yValue: number | string = getInvertedValue(
      axesScaleType.yAxis,
      circle.y,
      attrRef.current.yScale,
      true,
    );

    // hover circle changed case
    if (
      force ||
      circle.key !== attrRef.current.activePoint?.key ||
      circle.x !== attrRef.current.activePoint?.xPos ||
      circle.y !== attrRef.current.activePoint?.yPos ||
      !_.isEqual(attrRef.current.nearestCircles, nearestCircles)
    ) {
      setCirclesHighlightMode();
      drawVerticalAxisLine(circle.x);
      drawHorizontalAxisLine(circle.y);
      drawXAxisLabel(xValue);
      drawYAxisLabel(yValue);
      drawCircles(nearestCircles);
      drawActiveCircle(circle.key, circle.inProgress);
    }

    const activePoint = getActivePoint(circle, xValue, yValue);
    attrRef.current.currentXValue = activePoint.xValue;
    attrRef.current.activePoint = activePoint;
    attrRef.current.nearestCircles = nearestCircles;
    return activePoint;
  }

  function updateFocusedChart(args: IUpdateFocusedChartArgs = {}): void {
    const { xScale, yScale, focusedState, activePoint, dataSelector } =
      attrRef.current;

    const {
      mousePos,
      focusedStateActive = focusedState?.active || false,
      force = false,
    } = args;

    let mousePosition: [number, number] | [] = [];
    if (mousePos) {
      mousePosition = mousePos;
    } else if (focusedState?.active && focusedState.visId === id) {
      mousePosition = [
        xScale(focusedState.xValue),
        yScale(focusedState.yValue),
      ];
    } else if (activePoint?.xValue && activePoint.yValue) {
      mousePosition = [xScale(activePoint.xValue), yScale(activePoint.yValue)];
    }

    if (mousePosition?.length) {
      const [mouseX, mouseY] = mousePosition;
      const closestCircle = getClosestCircle(mouseX, mouseY, data);
      if (closestCircle) {
        const nearestCircles = getNearestCircles(closestCircle.x);
        let activePoint = drawAttributes(closestCircle, nearestCircles, force);
        if (focusedStateActive) {
          drawFocusedCircle(activePoint.key, activePoint.inProgress);
        }
        const focusedState = getFocusedState(activePoint, focusedStateActive);
        attrRef.current.focusedState = focusedState;

        safeSyncHoverState({ activePoint, focusedState, dataSelector });
      }
    } else {
      drawInitialAttributes();
    }
  }

  function drawInitialAttributes() {
    const {
      xScale,
      focusedState,
      currentXValue = xScale.domain()[1],
    } = attrRef.current;

    const xValue = focusedState?.active ? focusedState.xValue : currentXValue;
    const mouseX = xScale(xValue);

    if (isNaN(xValue) || isNaN(mouseX)) return;

    const nearestCircles = getNearestCircles(mouseX);
    clearHorizontalAxisLine();
    clearYAxisLabel();

    if (focusedState?.active) {
      setLinesHighlightMode();
      setCirclesHighlightMode();
    }

    drawVerticalAxisLine(mouseX);
    drawCircles(nearestCircles);

    const newXValue = getInvertedValue(
      axesScaleType.xAxis,
      mouseX,
      attrRef.current.xScale,
    );
    drawXAxisLabel(newXValue);
    attrRef.current.currentXValue = newXValue;
  }

  function setActiveLineAndCircle(
    lineKey: string,
    focusedStateActive: boolean = false,
    force: boolean = false,
  ): void {
    const { xScale, currentXValue, dataSelector } = attrRef.current;
    if (currentXValue || currentXValue === 0) {
      const mouseX = xScale(currentXValue);
      const closestCircle = getNearestCircles(mouseX).find(
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
          drawFocusedCircle(activePoint.key, activePoint.inProgress);
        }
        const focusedState = getFocusedState(activePoint, focusedStateActive);
        attrRef.current.focusedState = focusedState;

        safeSyncHoverState({ activePoint, focusedState, dataSelector });
      }
    }
  }

  function updateScales(xScale: IAxisScale, yScale: IAxisScale): void {
    attrRef.current.xScale = xScale;
    attrRef.current.yScale = yScale;
    setScaledValues(data);
  }

  // Interactions
  function safeSyncHoverState(args: ISyncHoverStateArgs): void {
    if (typeof syncHoverState === 'function') {
      syncHoverState(args);
    }
  }

  function handlePointClick(this: SVGElement, event: MouseEvent): void {
    if (attrRef.current.focusedState?.visId !== id) {
      safeSyncHoverState({ activePoint: null });
    }
    const mousePos = d3.pointer(event);
    const [mouseX, mouseY] = mousePos;
    const closestCircle = getClosestCircle(mouseX, mouseY, data);
    if (closestCircle) {
      const nearestCircles = getNearestCircles(closestCircle.x);
      let activePoint = drawAttributes(closestCircle, nearestCircles, true);
      const focusedState = getFocusedState(activePoint, true);
      attrRef.current.focusedState = focusedState;

      drawFocusedCircle(activePoint.key, activePoint.inProgress);
      safeSyncHoverState({
        activePoint,
        focusedState,
        dataSelector: attrRef.current.dataSelector,
      });
    }
  }

  function getFocusedState(
    activePoint: IActivePoint,
    focusedStateActive: boolean = false,
  ): IFocusedState {
    return {
      active: focusedStateActive,
      key: activePoint.key,
      xValue: activePoint.xValue,
      yValue: activePoint.yValue,
      chartIndex: activePoint.chartIndex,
      visId: activePoint.visId,
    };
  }

  function handleLineClick(this: SVGElement, event: MouseEvent): void {
    if (attrRef.current.focusedState?.visId !== id) {
      safeSyncHoverState({ activePoint: null });
    }
    const mousePos = d3.pointer(event);
    updateFocusedChart({ mousePos, focusedStateActive: false, force: true });
  }

  function handleLeaveFocusedPoint(event: MouseEvent): void {
    if (attrRef.current.focusedState?.visId !== id) {
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
    if (attrRef.current.focusedState?.active) {
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
    if (attrRef.current.focusedState?.active) {
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

  function setScaledValues(
    data: HoverAttrData[],
    xScale = attrRef.current?.xScale,
    yScale = attrRef.current?.yScale,
  ): void {
    if (attrRef.current && xScale && yScale) {
      attrRef.current.scaledValues = [];
      for (let i = 0; i < data.length; i++) {
        attrRef.current.scaledValues.push(
          data[i].data.xValues.map((xValue, index) => ({
            x: xScale(xValue) as number,
            y: yScale(data[i].data.yValues[index]) as number,
          })),
        );
      }
    }
  }

  attrRef.current.updateScales = updateScales;
  attrRef.current.setActiveLineAndCircle = setActiveLineAndCircle;
  attrRef.current.updateHoverAttributes = updateHoverAttributes;
  attrRef.current.updateFocusedChart = updateFocusedChart;
  attrRef.current.clearHoverAttributes = clearHoverAttributes;

  svgNodeRef.current?.on('mousemove', handleMouseMove);
  svgNodeRef.current?.on('mouseleave', handleMouseLeave);
  linesNodeRef.current?.on('click', handleLineClick);
  bgRectNodeRef.current?.on('click', handleLeaveFocusedPoint);

  // call on every render
  setScaledValues(data);
  drawActiveRunsIndicators(processedData);
  if (attrRef.current.focusedState?.key) {
    updateFocusedChart({ force: true });
  } else {
    drawInitialAttributes();
  }
}
export default drawHoverAttributes;
