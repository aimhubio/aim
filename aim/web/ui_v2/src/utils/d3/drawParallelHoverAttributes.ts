import * as d3 from 'd3';
import { isNil, isEmpty } from 'lodash-es';

import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';
import {
  IActivePoint,
  INearestCircle,
} from 'types/utils/d3/drawHoverAttributes';
import {
  IDrawParallelHoverAttributesProps,
  IGetParallelNearestCirclesProps,
  IParallelClosestCircle,
} from 'types/utils/d3/drawParallelHoverAttributes';
import { getCoordinates, CircleEnum, ScaleEnum } from './';
import { IGetAxisScale } from '../../types/utils/d3/getAxisScale';
import getFormattedValue from '../formattedValue';

const drawParallelHoverAttributes = ({
  dimensions,
  index,
  attributesNodeRef,
  attributesRef,
  linesRef,
  visAreaRef,
  visBoxRef,
  closestCircleRef,
  isVisibleColorIndicator,
  syncHoverState,
  linesNodeRef,
  highlightedNodeRef,
  highlightMode,
}: IDrawParallelHoverAttributesProps) => {
  const { top: chartTop, left: chartLeft }: { top: number; left: number } =
    visAreaRef.current?.getBoundingClientRect() || {};
  const { margin } = visBoxRef.current;
  const svgArea = d3.select(visAreaRef.current).select('svg');
  const keysOfDimensions = Object.keys(dimensions);

  function getActivePoint(circle: INearestCircle): IActivePoint {
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
      xValue: attributesRef.current.xScale(dimensionLabel),
      yValue,
      xPos: circle.x,
      yPos: circle.y,
      pageX: chartLeft + circle.x + margin.left,
      pageY: chartTop + circle.y + margin.top,
      chartIndex: index,
    };
  }

  function updateHoverAttributes(
    mouse: [number, number],
    brushEventUpdate: boolean = false,
  ) {
    const dimensionLabel = scalePointValue(
      attributesRef.current.xScale,
      mouse[0],
    );
    if (dimensionLabel) {
      const { mouseX, mouseY } = getCoordinates({
        mouse,
        xScale: attributesRef.current.xScale,
        yScale: attributesRef.current.yScale[dimensionLabel],
        margin,
      });
      const { nearestCircles, closestCircle } = getNearestCircles({
        data: linesRef.current.data,
        xScale: attributesRef.current.xScale,
        yScale: attributesRef.current.yScale,
        mouseX,
        mouseY,
        keysOfDimensions,
        isVisibleColorIndicator,
      });
      const lineCirclesOfClosestCircle = getLineCirclesOfClosestCircle({
        xScale: attributesRef.current.xScale,
        yScale: attributesRef.current.yScale,
        closestCircle,
        nearestCircles,
        keysOfDimensions,
      });

      if (closestCircleRef.current !== closestCircle) {
        // hover Line Changed case
        if (
          closestCircle.key !== closestCircleRef.current?.key ||
          brushEventUpdate
        ) {
          linesNodeRef.current.classed(
            'highlight',
            highlightMode !== HighlightEnum.Off,
          );
          // previous line
          if (closestCircleRef.current?.key) {
            linesNodeRef.current
              .selectAll(`[id=Line-${closestCircleRef.current.key}]`)
              .classed('active', false);
            highlightedNodeRef.current.classed('highlighted', false);
          }
          // new line
          const newActiveLine = linesNodeRef.current.selectAll(
            `[id=Line-${closestCircle.key}]`,
          );
          if (!isEmpty(newActiveLine.nodes())) {
            const linesSelectorToHighlight =
              newActiveLine.attr('data-selector');
            // set highlighted lines
            highlightedNodeRef.current = linesNodeRef.current
              .selectAll(`[data-selector=${linesSelectorToHighlight}]`)
              .classed('highlighted', true)
              .raise();
            // set active line
            newActiveLine?.classed('active', true).raise();
          }
        }
        // hover Circle Changed case
        if (
          closestCircle.x !== closestCircleRef.current?.x ||
          closestCircle.y !== closestCircleRef.current?.y ||
          brushEventUpdate
        ) {
          // Draw Circles
          drawParallelCircles(
            nearestCircles,
            lineCirclesOfClosestCircle,
            closestCircle,
          );
          if (typeof syncHoverState === 'function') {
            syncHoverState({ activePoint: getActivePoint(closestCircle) });
          }
        }
      }

      closestCircleRef.current = closestCircle;
      attributesRef.current.x = closestCircle.x + margin.left;
      attributesRef.current.y = closestCircle.y + margin.top;
      attributesRef.current.mousePosition = mouse;
    }
  }

  function drawParallelCircles(
    nearestCircles: INearestCircle[],
    lineCirclesOfClosestCircle: INearestCircle[],
    closestCircle: INearestCircle,
  ) {
    attributesNodeRef.current.classed(
      'highlight',
      highlightMode !== HighlightEnum.Off,
    );
    attributesNodeRef.current
      .selectAll('circle')
      .data([...nearestCircles, ...lineCirclesOfClosestCircle])
      .join('circle')
      .raise()
      .attr('class', 'HoverCircle')
      .attr('class', 'ParallelCircle')
      .attr('id', (circle: INearestCircle) => `Circle-${circle.key}`)
      .attr('data-key', (circle: INearestCircle) => circle.key)
      .attr('clip-path', 'url(#circles-rect-clip-' + index + ')')
      .attr('cx', (circle: INearestCircle) => circle.x)
      .attr('cy', (circle: INearestCircle) => circle.y)
      .attr('r', CircleEnum.Radius)
      .style('fill', (circle: INearestCircle) =>
        isVisibleColorIndicator
          ? attributesRef.current.yColorIndicatorScale(circle.lastYScalePos)
          : circle.color,
      )
      .on('click', function (this: SVGElement) {
        // TODO handle click
        d3.select(this).classed('active', false).classed('focus', true);
      });
    // set active circle
    drawActiveCircle(closestCircle);
  }

  function drawActiveCircle(closestCircle: INearestCircle) {
    d3.selectAll(`[id=Circle-${closestCircle.key}]`)
      .attr('r', CircleEnum.ActiveRadius)
      .classed('active', true)
      .raise();
    d3.selectAll(`[id=Circle-${closestCircle.key}line]`)
      .attr('r', CircleEnum.ActiveRadius)
      .classed('active', true)
      .raise();
  }

  function setActiveLine(lineKey: string) {
    const { mouseX, mouseY } = getCoordinates({
      mouse: [attributesRef.current.x, attributesRef.current.y],
      xScale: attributesRef.current.xScale,
      yScale:
        attributesRef.current.yScale[
          scalePointValue(attributesRef.current.xScale, attributesRef.current.x)
        ],
      margin,
    });

    const { nearestCircles } = getNearestCircles({
      data: linesRef.current.data,
      xScale: attributesRef.current.xScale,
      yScale: attributesRef.current.yScale,
      mouseX,
      mouseY,
      keysOfDimensions,
    });

    nearestCircles.forEach((circle: INearestCircle) => {
      if (circle.key !== lineKey) {
        return;
      }
      updateHoverAttributes([circle.x + margin.left, circle.y + margin.top]);
    });
  }

  function handleMouseMove(event: MouseEvent) {
    const mouse = d3.pointer(event);
    updateHoverAttributes(mouse);
  }

  function handleMouseLeave() {
    if (closestCircleRef.current?.key) {
      linesNodeRef.current.classed('highlight', false);

      linesNodeRef.current
        .selectAll(`[id=Line-${closestCircleRef.current.key}]`)
        .classed('active', false);

      attributesNodeRef.current.classed('highlight', false);

      attributesNodeRef.current
        .selectAll(`[id=Circle-${closestCircleRef.current.key}]`)
        .attr('r', CircleEnum.Radius)
        .classed('active', false);

      attributesNodeRef.current
        .selectAll(`[id=Circle-${closestCircleRef.current.key}line]`)
        .remove();

      attributesNodeRef.current.selectAll('.HoverLine-y').remove();
    }
  }

  svgArea?.on('mousemove', handleMouseMove);
  svgArea?.on('mouseleave', handleMouseLeave);
  attributesRef.current.updateHoverAttributes = updateHoverAttributes;
  attributesRef.current.setActiveLine = setActiveLine;
};

// TODO IGetNearestCircles interface removed need to fix (returned any) type
function getNearestCircles({
  data,
  xScale,
  yScale,
  mouseX,
  mouseY,
  keysOfDimensions,
  isVisibleColorIndicator,
}: IGetParallelNearestCirclesProps): any {
  let closestCircles: IParallelClosestCircle[] = [
    {
      key: '',
      r: null,
      x: 0,
      y: 0,
      values: {},
      color: '',
    },
  ];
  const nearestCircles: INearestCircle[] = [];
  for (const line of data) {
    let colorIndicatorYPixel: number = 0;
    if (isVisibleColorIndicator) {
      const lastKeyOfDimension: string =
        keysOfDimensions[keysOfDimensions.length - 1];
      const lastYScale: IGetAxisScale = yScale[lastKeyOfDimension];
      colorIndicatorYPixel = lastYScale(line.values[lastKeyOfDimension]) || 0;
    }
    const xAxesValues = keysOfDimensions.map((d: string) => xScale(d));
    const index = d3.bisectCenter(xAxesValues, mouseX);
    const closestXPixel = xScale(keysOfDimensions[index]);
    const closestYPixel = yScale[keysOfDimensions[index]](
      line.values[keysOfDimensions[index]],
    );
    // Find closest circles
    const rX = Math.abs(closestXPixel - mouseX);
    const rY = Math.abs(closestYPixel - mouseY);
    const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
    if (closestCircles[0].r === null || r <= closestCircles[0].r) {
      const circle = {
        key: line.key,
        values: line.values,
        color: line.color,
        lastYScalePos: colorIndicatorYPixel,
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
    if (!isNil(closestYPixel)) {
      nearestCircles.push({
        x: closestXPixel,
        y: closestYPixel,
        lastYScalePos: colorIndicatorYPixel,
        key: line.key,
        color: line.color,
      });
    }
  }
  closestCircles.sort((a, b) => (a.key > b.key ? 1 : -1));

  return {
    nearestCircles,
    closestCircle: closestCircles[0],
  };
}

function getLineCirclesOfClosestCircle({
  keysOfDimensions,
  xScale,
  yScale,
  closestCircle,
  nearestCircles,
}: any) {
  const lineCirclesOfClosestCircle: INearestCircle[] = [];

  keysOfDimensions.forEach((dimension: string) => {
    const closestXPixel = xScale(dimension);
    const closestYPixel = yScale[dimension](closestCircle.values[dimension]);
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

function scalePointValue(
  xScale: IGetAxisScale,
  xPos: number,
  rangeReversed: boolean = false,
) {
  const domain = rangeReversed ? xScale.domain().reverse() : xScale.domain();
  const range = rangeReversed ? xScale.range().reverse() : xScale.range();
  const rangePoints = d3.range(
    range[0],
    range[1],
    xScale.step && xScale.step(),
  );
  return domain[d3.bisect(rangePoints, xPos) - 1];
}

export default drawParallelHoverAttributes;
