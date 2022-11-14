import * as d3 from 'd3';
import _ from 'lodash-es';

import {
  IActivePoint,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import {
  IDrawParallelHoverAttributesArgs,
  IParallelNearestCircle,
  IUpdateParallelFocusedChartProps,
} from 'types/utils/d3/drawParallelHoverAttributes';
import { IAxisScale } from 'types/utils/d3/getAxisScale';
import { ILineDataType } from 'types/utils/d3/drawParallelLines';

import getRoundedValue from 'utils/roundValue';

import { CircleEnum, ScaleEnum } from './';

const drawParallelHoverAttributes = ({
  dimensions,
  index,
  nameKey,
  attributesNodeRef: attrNodeRef,
  attributesRef: attrRef,
  linesRef,
  visAreaRef,
  visBoxRef,
  bgRectNodeRef,
  isVisibleColorIndicator,
  syncHoverState,
  linesNodeRef,
  highlightedNodeRef,
  axesNodeRef,
  svgNodeRef,
}: IDrawParallelHoverAttributesArgs) => {
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

  const keysOfDimensions = Object.keys(dimensions);

  function getNearestCircles(mouseX: number): IParallelNearestCircle[] {
    const { xScale, yScale } = attrRef.current;
    const nearestCircles: IParallelNearestCircle[] = [];
    for (const line of linesRef.current.data) {
      const xAxesValues = keysOfDimensions.map((d: string) => xScale(d));
      const index = d3.bisectCenter(xAxesValues, mouseX);
      const closestXPixel = xScale(keysOfDimensions[index]);
      const closestYPixel = yScale[keysOfDimensions[index]](
        line.values[keysOfDimensions[index]],
      );
      if (!_.isNil(closestYPixel)) {
        nearestCircles.push({
          x: closestXPixel,
          y: closestYPixel,
          lastYScalePos: getColorIndicatorYPixel(line),
          key: line.key,
          values: line.values,
          color: line.color,
        });
      }
    }

    return nearestCircles;
  }

  function getClosestCircle(
    nearestCircles: IParallelNearestCircle[],
    mouseX: number,
    mouseY: number,
  ): IParallelNearestCircle {
    let closestCircles: IParallelNearestCircle[] = [];
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

  function getLineCirclesOfClosestCircle(
    closestCircle: IParallelNearestCircle,
    nearestCircles: IParallelNearestCircle[],
  ): IParallelNearestCircle[] {
    const { xScale, yScale } = attrRef.current;
    const lineCirclesOfClosestCircle: IParallelNearestCircle[] = [];

    keysOfDimensions.forEach((dimension: string) => {
      const closestXPixel = xScale(dimension);
      const closestYPixel = yScale[dimension](
        closestCircle.values && closestCircle.values[dimension],
      );
      if (nearestCircles[0]?.x !== closestXPixel && !_.isNil(closestYPixel)) {
        lineCirclesOfClosestCircle.push({
          x: closestXPixel,
          y: closestYPixel,
          lastYScalePos: closestCircle.lastYScalePos,
          key: closestCircle.key + 'line',
          color: closestCircle.color,
        });
      }
    });
    return lineCirclesOfClosestCircle;
  }

  function getColorIndicatorYPixel(line: ILineDataType) {
    const { yScale } = attrRef.current;
    let colorIndicatorYPixel: number = 0;
    if (isVisibleColorIndicator) {
      const lastKeyOfDimension: string =
        keysOfDimensions[keysOfDimensions.length - 1];
      const lastYScale: IAxisScale = yScale[lastKeyOfDimension];
      colorIndicatorYPixel = lastYScale(line.values[lastKeyOfDimension]) || 0;
    }

    return colorIndicatorYPixel;
  }

  function getActivePoint(circle: IParallelNearestCircle): IActivePoint {
    const dimensionLabel = scalePointValue(attrRef.current.xScale, circle.x);
    let yValue: number = 0;

    if (dimensions[dimensionLabel].scaleType === ScaleEnum.Point) {
      yValue = scalePointValue(
        attrRef.current.yScale[dimensionLabel],
        circle.y,
        true,
      );
    } else {
      yValue = getRoundedValue(
        attrRef.current.yScale[dimensionLabel].invert(circle.y),
      );
    }

    return {
      key: circle.key,
      xValue: dimensionLabel,
      yValue,
      xPos: circle.x,
      yPos: circle.y,
      chartIndex: index,
      pointRect: {
        top: chartRect.top + margin.top + circle.y - CircleEnum.ActiveRadius,
        bottom: chartRect.top + margin.top + circle.y + CircleEnum.ActiveRadius,
        left: chartRect.left + margin.left + circle.x - CircleEnum.ActiveRadius,
        right:
          chartRect.left + margin.left + circle.x + CircleEnum.ActiveRadius,
      },
    };
  }

  function updateFocusedChart(args: IUpdateParallelFocusedChartProps = {}) {
    const { xScale, yScale, focusedState, activePoint } = attrRef.current;

    const {
      mousePos,
      focusedStateActive = focusedState?.active || false,
      force = false,
    } = args;

    let mousePosition: [number, number] | [] = [];
    let dimensionLabel = '';
    if (mousePos) {
      dimensionLabel = scalePointValue(xScale, mousePos[0]);
      mousePosition = mousePos;
    } else if (focusedState?.active && focusedState.chartIndex === index) {
      const xPos = xScale(focusedState.xValue);
      dimensionLabel = scalePointValue(xScale, xPos);
      mousePosition = [xPos, yScale[dimensionLabel]?.(focusedState.yValue)];
    } else if (activePoint?.xValue && activePoint.yValue) {
      const xPos = xScale(activePoint.xValue);
      dimensionLabel = scalePointValue(xScale, xPos);
      mousePosition = [
        xScale(activePoint.xValue),
        yScale[dimensionLabel]?.(activePoint.yValue),
      ];
    }
    if (dimensionLabel && mousePosition.length === 2) {
      const [mouseX, mouseY] = mousePosition;
      const nearestCircles = getNearestCircles(mouseX);
      const closestCircle = getClosestCircle(nearestCircles, mouseX, mouseY);
      const lineCirclesOfClosestCircle = closestCircle
        ? getLineCirclesOfClosestCircle(closestCircle, nearestCircles)
        : [];

      // hover Line Changed case
      if (closestCircle?.key !== attrRef.current?.lineKey || force) {
        linesNodeRef.current.classed('highlight', false);
        // previous line
        clearActiveLine(attrRef.current.lineKey);
        // new line
        drawActiveLine(closestCircle?.key);
        if (closestCircle) {
          const activePoint = getActivePoint(closestCircle);
          drawParallelCircles(
            nearestCircles,
            lineCirclesOfClosestCircle,
            closestCircle,
          );
          if (focusedStateActive) {
            drawFocusedCircle(closestCircle.key);
          }
          safeSyncHoverState({ activePoint, focusedStateActive });
          attrRef.current.activePoint = activePoint;
          attrRef.current.lineKey = closestCircle.key;
          attrRef.current.x = closestCircle.x;
          attrRef.current.y = closestCircle.y;
        }
      }
    }
  }

  function drawActiveCircle(key: string) {
    d3.selectAll(`[id=Circle-${key}]`)
      .attr('r', CircleEnum.ActiveRadius)
      .classed('active', true)
      .raise();
    d3.selectAll(`[id=Circle-${key}line]`)
      .attr('r', CircleEnum.ActiveRadius)
      .classed('active', true)
      .raise();
  }

  function drawActiveLine(key: string): void {
    // new line
    const newActiveLine = linesNodeRef.current.selectAll(`[id=Line-${key}]`);

    if (!_.isEmpty(newActiveLine.nodes())) {
      const linesSelectorToHighlight = newActiveLine.attr('data-selector');
      // set highlighted lines
      highlightedNodeRef.current = linesNodeRef.current
        .selectAll(`[data-selector=${linesSelectorToHighlight}]`)
        .classed('highlighted', true)
        .raise();
      // set active line
      newActiveLine?.classed('active', true).raise();
    }

    attrRef.current.lineKey = key;
  }

  function clearActiveLine(key?: string): void {
    // previous line
    if (key) {
      linesNodeRef.current
        .selectAll(`[id=Line-${key}]`)
        .classed('active', false);
      highlightedNodeRef.current.classed('highlighted', false);
    }
  }

  function drawFocusedCircle(key: string): void {
    attrNodeRef.current
      .selectAll('circle')
      .attr('r', CircleEnum.Radius)
      .classed('active', false)
      .classed('focus', false);

    attrNodeRef.current.select('.focus__shadow')?.remove();

    const newFocusedPoint = attrNodeRef.current.select(`[id=Circle-${key}]`);

    newFocusedPoint
      .classed('focus', true)
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

  function drawParallelCircles(
    nearestCircles: IParallelNearestCircle[],
    lineCirclesOfClosestCircle: IParallelNearestCircle[],
    closestCircle: IParallelNearestCircle,
  ) {
    attrNodeRef.current.classed('highlight', false);
    attrNodeRef.current
      .selectAll('circle')
      .data([...nearestCircles, ...lineCirclesOfClosestCircle])
      .join('circle')
      .raise()
      .attr('class', 'HoverCircle')
      .attr('id', (d: IParallelNearestCircle) => `Circle-${d.key}`)
      .attr('data-key', (d: IParallelNearestCircle) => d.key)
      .attr('clip-path', `url(#${nameKey}-circles-rect-clip-${index})`)
      .attr('cx', (d: IParallelNearestCircle) => d.x.toFixed(2))
      .attr('cy', (d: IParallelNearestCircle) => d.y.toFixed(2))
      .attr('r', CircleEnum.Radius)
      .attr('stroke', (d: IParallelNearestCircle) =>
        isVisibleColorIndicator
          ? attrRef.current.yColorIndicatorScale(d.lastYScalePos)
          : d.color,
      )
      .attr('stroke-opacity', 1)
      .on('click', handlePointClick);
    // set active circle
    drawActiveCircle(closestCircle?.key);
  }

  // Interactions
  function handlePointClick(this: SVGElement, event: MouseEvent): void {
    if (attrRef.current.focusedState?.chartIndex !== index) {
      safeSyncHoverState({ activePoint: null });
    }
    const mousePos = d3.pointer(event);
    updateFocusedChart({ mousePos, focusedStateActive: true, force: true });
  }

  function handleLineClick(this: SVGElement, event: MouseEvent): void {
    if (attrRef.current.focusedState?.chartIndex !== index) {
      safeSyncHoverState({ activePoint: null });
    }
    const mousePos = d3.pointer(event);
    updateFocusedChart({ mousePos, focusedStateActive: false, force: true });
  }

  function setActiveLineAndCircle(
    lineKey: string,
    focusedStateActive: boolean = false,
    force: boolean = false,
  ): void {
    let xPos = 0;
    const xStep = attrRef.current.xScale.step();
    let closestCircle;
    let nearestCircles;
    while (xPos <= attrRef.current.xScale.range()[1]) {
      nearestCircles = getNearestCircles(xPos);
      closestCircle = nearestCircles.find((c) => c.key === lineKey);
      if (closestCircle) {
        break;
      }
      xPos += xStep;
    }

    if (closestCircle?.key !== attrRef.current?.lineKey || force) {
      const lineCirclesOfClosestCircle = closestCircle
        ? //@ts-ignore
          getLineCirclesOfClosestCircle(closestCircle, nearestCircles)
        : [];
      linesNodeRef.current.classed('highlight', false);
      // previous line
      clearActiveLine(attrRef.current.lineKey);
      // new line
      //@ts-ignore
      drawActiveLine(closestCircle?.key);
      if (closestCircle) {
        const activePoint = getActivePoint(closestCircle);
        drawParallelCircles(
          //@ts-ignore
          nearestCircles,
          lineCirclesOfClosestCircle,
          closestCircle,
        );
        if (focusedStateActive) {
          drawFocusedCircle(closestCircle?.key);
        }
        safeSyncHoverState({ activePoint, focusedStateActive });
        attrRef.current.activePoint = activePoint;
        attrRef.current.lineKey = closestCircle.key;
        attrRef.current.x = closestCircle.x + margin.left;
        attrRef.current.y = closestCircle.y + margin.top;
      }
    }
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

  function handleMouseLeave() {
    if (attrRef.current.focusedState?.active) {
      return;
    }
    if (attrRef.current?.lineKey) {
      linesNodeRef.current.classed('highlight', false);

      linesNodeRef.current
        .selectAll(`[id=Line-${attrRef.current?.lineKey}]`)
        .classed('active', false);

      attrNodeRef.current.classed('highlight', false);

      attrNodeRef.current
        .selectAll(`[id=Circle-${attrRef.current?.lineKey}]`)
        .attr('r', CircleEnum.Radius)
        .classed('active', false);

      attrNodeRef.current
        .selectAll(`[id=Circle-${attrRef.current?.lineKey}line]`)
        .remove();

      if (rafID) {
        window.cancelAnimationFrame(rafID);
      }
      clearHoverAttributes();
      safeSyncHoverState({ activePoint: null });
    }
  }

  function handleLeaveFocusedPoint(
    event: MouseEvent,
    type: 'axes' | 'bg',
  ): void {
    if (attrRef.current.focusedState?.chartIndex !== index) {
      safeSyncHoverState({ activePoint: null });
    }
    const mousePos = d3.pointer(event);
    updateFocusedChart({
      mousePos:
        type === 'axes'
          ? mousePos
          : [
              Math.floor(mousePos[0]) - margin.left,
              Math.floor(mousePos[1]) - margin.top,
            ],
      force: true,
      focusedStateActive: false,
    });
  }

  function clearHoverAttributes(): void {
    attrRef.current.activePoint = undefined;
    attrRef.current.lineKey = undefined;

    linesNodeRef.current.classed('highlight', false);
    attrNodeRef.current.classed('highlight', false);

    linesNodeRef.current
      .selectAll('path')
      .classed('highlighted', false)
      .classed('active', false);

    attrNodeRef.current.selectAll('circle').remove();
  }

  function safeSyncHoverState(args: ISyncHoverStateArgs): void {
    if (typeof syncHoverState === 'function') {
      syncHoverState(args);
    }
  }

  attrRef.current.updateFocusedChart = updateFocusedChart;
  attrRef.current.setActiveLineAndCircle = setActiveLineAndCircle;
  attrRef.current.clearHoverAttributes = clearHoverAttributes;

  svgNodeRef.current?.on('mousemove', handleMouseMove);
  svgNodeRef.current?.on('mouseleave', handleMouseLeave);
  linesNodeRef.current?.on('click', handleLineClick);
  bgRectNodeRef.current?.on('click', (e: MouseEvent) =>
    handleLeaveFocusedPoint(e, 'bg'),
  );
  axesNodeRef.current?.on('click', (e: MouseEvent) =>
    handleLeaveFocusedPoint(e, 'axes'),
  );

  // call on every render
  if (attrRef.current.focusedState) {
    updateFocusedChart({ force: true });
  }
};

function scalePointValue(
  xScale: IAxisScale,
  xPos: number,
  rangeReversed: boolean = false,
) {
  const domain = rangeReversed ? xScale.domain().reverse() : xScale.domain();
  const range = rangeReversed ? xScale.range().reverse() : xScale.range();
  const rangePoints = d3.range(
    range[0],
    range[1],
    xScale.step && xScale.step() - 1,
  );

  return domain[d3.bisect(rangePoints, xPos) - 1];
}

export default drawParallelHoverAttributes;
