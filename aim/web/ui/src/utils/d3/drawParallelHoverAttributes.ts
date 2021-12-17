import * as d3 from 'd3';
import { isNil, isEmpty } from 'lodash-es';

import {
  IActivePoint,
  INearestCircle,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import {
  IDrawParallelHoverAttributesArgs,
  IParallelNearestCircle,
  IUpdateParallelFocusedChartProps,
} from 'types/utils/d3/drawParallelHoverAttributes';
import { IAxisScale } from 'types/utils/d3/getAxisScale';
import { ILineDataType } from 'types/utils/d3/drawParallelLines';

import getFormattedValue from 'utils/formattedValue';

import { getCoordinates, CircleEnum, ScaleEnum } from './';

const drawParallelHoverAttributes = ({
  dimensions,
  index,
  attributesNodeRef,
  attributesRef,
  linesRef,
  visAreaRef,
  visBoxRef,
  bgRectNodeRef,
  isVisibleColorIndicator,
  syncHoverState,
  linesNodeRef,
  highlightedNodeRef,
  axesNodeRef,
}: IDrawParallelHoverAttributesArgs) => {
  const chartRect: DOMRect = visAreaRef.current?.getBoundingClientRect() || {};
  let rafID = 0;

  const { margin } = visBoxRef.current;
  const svgArea = d3.select(visAreaRef.current).select('svg');
  const keysOfDimensions = Object.keys(dimensions);

  function getNearestCircles(mouseX: number): IParallelNearestCircle[] {
    const { xScale, yScale } = attributesRef.current;
    const nearestCircles: IParallelNearestCircle[] = [];
    for (const line of linesRef.current.data) {
      const xAxesValues = keysOfDimensions.map((d: string) => xScale(d));
      const index = d3.bisectCenter(xAxesValues, mouseX);
      const closestXPixel = xScale(keysOfDimensions[index]);
      const closestYPixel = yScale[keysOfDimensions[index]](
        line.values[keysOfDimensions[index]],
      );
      if (!isNil(closestYPixel)) {
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
    const { xScale, yScale } = attributesRef.current;
    const lineCirclesOfClosestCircle: IParallelNearestCircle[] = [];

    keysOfDimensions.forEach((dimension: string) => {
      const closestXPixel = xScale(dimension);
      const closestYPixel = yScale[dimension](
        closestCircle.values && closestCircle.values[dimension],
      );
      if (nearestCircles[0]?.x !== closestXPixel && !isNil(closestYPixel)) {
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
    const { yScale } = attributesRef.current;
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
    const dimensionLabel = scalePointValue(
      attributesRef.current.xScale,
      circle.x,
    );
    let yValue: number = 0;

    if (dimensions[dimensionLabel].scaleType === ScaleEnum.Point) {
      yValue = scalePointValue(
        attributesRef.current.yScale[dimensionLabel],
        circle.y,
        true,
      );
    } else {
      yValue = getFormattedValue(
        attributesRef.current.yScale[dimensionLabel].invert(circle.y),
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

  function updateFocusedChart({
    mouse,
    focusedStateActive = attributesRef.current.focusedState?.active || false,
    force,
  }: IUpdateParallelFocusedChartProps) {
    const { xScale, yScale, focusedState, activePoint } = attributesRef.current;
    let mousePosition: [number, number] | [] = [];
    let dimensionLabel: string = '';
    if (mouse) {
      dimensionLabel = scalePointValue(attributesRef.current.xScale, mouse[0]);
      mousePosition = mouse;
    } else if (focusedState?.active && focusedState.chartIndex === index) {
      const xPos = xScale(focusedState.xValue);
      dimensionLabel = scalePointValue(attributesRef.current.xScale, xPos);
      mousePosition = [
        xPos,
        yScale[dimensionLabel](focusedState.yValue) + margin.top,
      ];
    } else if (activePoint?.xValue && activePoint.yValue) {
      const xPos = xScale(activePoint.xValue);
      dimensionLabel = scalePointValue(attributesRef.current.xScale, xPos);

      mousePosition = [
        xScale(activePoint.xValue),
        yScale[dimensionLabel]?.(activePoint.yValue) + margin.top,
      ];
    }

    if (dimensionLabel && mousePosition.length === 2) {
      const { mouseX, mouseY } = getCoordinates({
        mouse: mousePosition,
        xScale: attributesRef.current.xScale,
        yScale: attributesRef.current.yScale[dimensionLabel],
        margin,
      });
      const nearestCircles = getNearestCircles(mouseX);
      const closestCircle = getClosestCircle(nearestCircles, mouseX, mouseY);
      const lineCirclesOfClosestCircle = closestCircle
        ? getLineCirclesOfClosestCircle(closestCircle, nearestCircles)
        : [];

      // hover Line Changed case
      if (closestCircle?.key !== attributesRef.current?.lineKey || force) {
        linesNodeRef.current.classed('highlight', false);
        // previous line
        clearActiveLine(attributesRef.current.lineKey);
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
          attributesRef.current.activePoint = activePoint;
          attributesRef.current.lineKey = closestCircle.key;
          attributesRef.current.x = closestCircle.x + margin.left;
          attributesRef.current.y = closestCircle.y + margin.top;
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
    event.stopPropagation();
    if (attributesRef.current.focusedState?.chartIndex !== index) {
      safeSyncHoverState({ activePoint: null });
    }
    const mousePos: [number, number] = [
      circle.x + margin.left,
      circle.y + margin.top,
    ];
    updateFocusedChart({
      mouse: mousePos,
      focusedStateActive: true,
      force: true,
    });
  }

  function setActiveLineAndCircle(
    lineKey: string,
    focusedStateActive: boolean = false,
    force: boolean = false,
  ): void {
    let xPos = 0;
    const xStep = attributesRef.current.xScale.step();
    let closestCircle;
    let nearestCircles;
    while (xPos <= attributesRef.current.xScale.range()[1]) {
      nearestCircles = getNearestCircles(xPos);
      closestCircle = nearestCircles.find((c) => c.key === lineKey);
      if (closestCircle) {
        break;
      }
      xPos += xStep;
    }

    if (closestCircle?.key !== attributesRef.current?.lineKey || force) {
      const lineCirclesOfClosestCircle = closestCircle
        ? //@ts-ignore
          getLineCirclesOfClosestCircle(closestCircle, nearestCircles)
        : [];
      linesNodeRef.current.classed('highlight', false);
      // previous line
      clearActiveLine(attributesRef.current.lineKey);
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
        attributesRef.current.activePoint = activePoint;
        attributesRef.current.lineKey = closestCircle.key;
        attributesRef.current.x = closestCircle.x + margin.left;
        attributesRef.current.y = closestCircle.y + margin.top;
      }
    }
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

  function drawParallelCircles(
    nearestCircles: IParallelNearestCircle[],
    lineCirclesOfClosestCircle: IParallelNearestCircle[],
    closestCircle: IParallelNearestCircle,
  ) {
    attributesNodeRef.current.classed('highlight', false);
    attributesNodeRef.current
      .selectAll('circle')
      .data([...nearestCircles, ...lineCirclesOfClosestCircle])
      .join('circle')
      .raise()
      .attr('class', 'HoverCircle')
      .attr('class', 'ParallelCircle')
      .attr('id', (circle: IParallelNearestCircle) => `Circle-${circle.key}`)
      .attr('data-key', (circle: IParallelNearestCircle) => circle.key)
      .attr('clip-path', 'url(#circles-rect-clip-' + index + ')')
      .attr('cx', (circle: IParallelNearestCircle) => circle.x)
      .attr('cy', (circle: IParallelNearestCircle) => circle.y)
      .attr('r', CircleEnum.Radius)
      .style('fill', (circle: IParallelNearestCircle) =>
        isVisibleColorIndicator
          ? attributesRef.current.yColorIndicatorScale(circle.lastYScalePos)
          : circle.color,
      )
      .on('click', handlePointClick);
    // set active circle
    drawActiveCircle(closestCircle?.key);
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

  function setActiveLine(lineKey: string) {
    const { mouseX } = getCoordinates({
      mouse: [attributesRef.current.x, attributesRef.current.y],
      xScale: attributesRef.current.xScale,
      yScale:
        attributesRef.current.yScale[
          scalePointValue(attributesRef.current.xScale, attributesRef.current.x)
        ],
      margin,
    });

    const nearestCircles = getNearestCircles(mouseX);

    nearestCircles.forEach((circle: INearestCircle) => {
      if (circle.key !== lineKey) {
        return;
      }
      const mouse: [number, number] = [
        circle.x + margin.left,
        circle.y + margin.top,
      ];
      updateFocusedChart({ mouse });
    });
  }

  function handleMouseMove(event: MouseEvent) {
    if (attributesRef.current.focusedState?.active) {
      return;
    }
    const mouse = d3.pointer(event);
    rafID = window.requestAnimationFrame(() => {
      updateFocusedChart({ mouse });
    });
  }

  function drawActiveLine(key: string): void {
    // new line
    const newActiveLine = linesNodeRef.current.selectAll(`[id=Line-${key}]`);

    if (!isEmpty(newActiveLine.nodes())) {
      const linesSelectorToHighlight = newActiveLine.attr('data-selector');
      // set highlighted lines
      highlightedNodeRef.current = linesNodeRef.current
        .selectAll(`[data-selector=${linesSelectorToHighlight}]`)
        .classed('highlighted', true)
        .raise();
      // set active line
      newActiveLine?.classed('active', true).raise();
    }

    attributesRef.current.lineKey = key;
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

  function handleMouseLeave() {
    if (attributesRef.current.focusedState?.active) {
      return;
    }
    if (attributesRef.current?.lineKey) {
      linesNodeRef.current.classed('highlight', false);

      linesNodeRef.current
        .selectAll(`[id=Line-${attributesRef.current?.lineKey}]`)
        .classed('active', false);

      attributesNodeRef.current.classed('highlight', false);

      attributesNodeRef.current
        .selectAll(`[id=Circle-${attributesRef.current?.lineKey}]`)
        .attr('r', CircleEnum.Radius)
        .classed('active', false);

      attributesNodeRef.current
        .selectAll(`[id=Circle-${attributesRef.current?.lineKey}line]`)
        .remove();

      if (rafID) {
        window.cancelAnimationFrame(rafID);
      }
      clearHoverAttributes();
      safeSyncHoverState({ activePoint: null });
    }
  }

  function handleLeaveFocusedPoint(event: MouseEvent): void {
    if (attributesRef.current.focusedState?.chartIndex !== index) {
      safeSyncHoverState({ activePoint: null });
    }
    const mousePos = d3.pointer(event);

    updateFocusedChart({
      mouse: [
        Math.floor(mousePos[0]) - margin.left,
        Math.floor(mousePos[1]) - margin.top,
      ],
      force: true,
      focusedStateActive: false,
    });
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

    attributesNodeRef.current.selectAll('circle').remove();
  }

  // Interactions
  function safeSyncHoverState(args: ISyncHoverStateArgs): void {
    if (typeof syncHoverState === 'function') {
      syncHoverState(args);
    }
  }

  function init() {
    const { focusedState } = attributesRef.current;
    if (
      focusedState?.chartIndex === index &&
      focusedState?.key &&
      focusedState?.xValue &&
      focusedState.yValue
    ) {
      updateFocusedChart({ force: true });
      if (focusedState?.active) {
        drawFocusedCircle(focusedState.key);
      }
    }
  }

  init();

  svgArea?.on('mousemove', handleMouseMove);
  svgArea?.on('mouseleave', handleMouseLeave);
  bgRectNodeRef.current?.on('click', handleLeaveFocusedPoint);
  linesNodeRef.current?.on('click', handleLeaveFocusedPoint);
  attributesNodeRef.current?.on('click', handleLeaveFocusedPoint);
  axesNodeRef.current?.on('click', handleLeaveFocusedPoint);
  attributesRef.current.setActiveLine = setActiveLine;
  attributesRef.current.updateFocusedChart = updateFocusedChart;
  attributesRef.current.setActiveLineAndCircle = setActiveLineAndCircle;
  attributesRef.current.clearHoverAttributes = clearHoverAttributes;
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
