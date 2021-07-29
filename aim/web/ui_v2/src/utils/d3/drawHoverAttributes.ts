import * as d3 from 'd3';

import {
  IClosestCircle,
  IDrawHoverAttributesProps,
  IAxisLineData,
  INearestCircle,
  ISetAxisLabelProps,
  IGetNearestCirclesProps,
  IGetNearestCircles,
} from 'types/utils/d3/drawHoverAttributes';
import { CircleEnum, getCoordinates } from './index';
import { IGetAxesScale } from 'types/utils/d3/getAxesScale';
import HighlightEnum from 'components/HighlightModesPopover/HighlightEnum';

import 'components/LineChart/LineChart.css';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    index,
    data,
    xAlignment,
    attributesNodeRef,
    attributesRef,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    closestCircleRef,
    xAxisLabelNodeRef,
    yAxisLabelNodeRef,
    linesNodeRef,
    highlightedNodeRef,
    highlightMode,
    focusedState,
    callback,
  } = props;

  attributesRef.current.updateScales = function (
    xScale: IGetAxesScale['xScale'],
    yScale: IGetAxesScale['yScale'],
  ) {
    attributesRef.current.xScale = xScale;
    attributesRef.current.yScale = yScale;
  };

  const { margin } = visBoxRef.current;
  const { height, width } = plotBoxRef.current;

  const svgArea = d3.select(visAreaRef.current).select('svg');

  function updateHoverAttributes(mouse: [number, number], force = false) {
    const { mouseX, mouseY } = getCoordinates({
      mouse,
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

    if (closestCircleRef.current !== closestCircle || force) {
      // hover Line Changed case
      if (closestCircle.key !== closestCircleRef.current?.key || force) {
        linesNodeRef.current.classed(
          'highlight',
          highlightMode !== HighlightEnum.Off,
        );
        // previous line
        if (closestCircleRef.current?.key) {
          linesNodeRef.current
            .select(`[id=Line-${closestCircleRef.current.key}]`)
            .classed('active', false);
          highlightedNodeRef.current.classed('highlighted', false);
        }
        // new line
        const newActiveLine = linesNodeRef.current.select(
          `[id=Line-${closestCircle.key}]`,
        );
        // get lines data selector
        const linesSelectorToHighlight = newActiveLine.attr('data-selector');
        // set highlighted lines
        highlightedNodeRef.current = linesNodeRef.current
          .selectAll(`[data-selector=${linesSelectorToHighlight}]`)
          .classed('highlighted', true)
          .raise();
        // set active line
        newActiveLine.classed('active', true).raise();
      }
      // hover Circle Changed case
      if (
        closestCircle.x !== closestCircleRef.current?.x ||
        closestCircle.y !== closestCircleRef.current?.y ||
        force
      ) {
        attributesNodeRef.current.classed(
          'highlight',
          highlightMode !== HighlightEnum.Off,
        );
        // FIXME need to check  axisLineData coords min max size
        const axisLineData: IAxisLineData[] = [
          { x1: closestCircle.x, y1: 0, x2: closestCircle.x, y2: height },
          { x1: 0, y1: closestCircle.y, x2: width, y2: closestCircle.y },
        ];
        // Draw horizontal/vertical lines
        attributesNodeRef.current
          .selectAll('line')
          .data(axisLineData)
          .join('line')
          .attr(
            'class',
            (d: IAxisLineData, i: number) =>
              `HoverLine HoverLine-${i === 0 ? 'x' : 'y'}`,
          )
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
          .attr('class', 'HoverCircle')
          .attr('id', (circle: INearestCircle) => `Circle-${circle.key}`)
          .attr('clip-path', 'url(#circles-rect-clip-' + index + ')')
          .attr('cx', (circle: INearestCircle) => circle.x)
          .attr('cy', (circle: INearestCircle) => circle.y)
          .attr('r', CircleEnum.Radius)
          .style('fill', (circle: INearestCircle) => circle.color)
          .on('click', function (this: SVGElement, circle: INearestCircle) {
            // TODO handle click
            d3.select(this).classed('active', false).classed('focus', true);
          });
        // set active circle
        d3.select(`[id=Circle-${closestCircle.key}]`)
          .attr('r', CircleEnum.ActiveRadius)
          .classed('active', true)
          .raise();

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
      }
      closestCircleRef.current = closestCircle;

      attributesRef.current.x = closestCircle.x + margin.left;
      attributesRef.current.y = closestCircle.y + margin.top;
    }

    return {
      key: closestCircleRef.current.key,
      xValue: attributesRef.current.xScale.invert(closestCircleRef.current.x),
      yValue: attributesRef.current.yScale.invert(closestCircleRef.current.y),
      chartIndex: index,
    };
  }

  // TODO: improve active line detection method
  function setActiveLine(lineKey: string, force = false) {
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
      if (circle.key !== lineKey) {
        return;
      }
      updateHoverAttributes(
        [circle.x + margin.left, circle.y + margin.top],
        force,
      );
    });
  }

  attributesRef.current.updateHoverAttributes = updateHoverAttributes;
  attributesRef.current.setActiveLine = setActiveLine;

  function handleMouseMove(event: MouseEvent) {
    const mouse = d3.pointer(event);
    const activePointData = updateHoverAttributes?.(mouse);

    if (typeof callback === 'function') {
      callback(mouse, activePointData);
    }
  }

  svgArea?.on('mousemove', handleMouseMove);

  svgArea?.on('mouseleave', () => {
    if (closestCircleRef.current?.key) {
      linesNodeRef.current.classed('highlight', false);

      linesNodeRef.current
        .select(`[id=Line-${closestCircleRef.current.key}]`)
        .classed('active', false);

      attributesNodeRef.current.classed('highlight', false);

      attributesNodeRef.current
        .select(`[id=Circle-${closestCircleRef.current.key}]`)
        .attr('r', CircleEnum.Radius)
        .classed('active', false);

      attributesNodeRef.current.select('.HoverLine-y').remove();
      yAxisLabelNodeRef.current?.remove();
    }
  });

  if (focusedState.key !== null) {
    setActiveLine(focusedState.key, true);
  } else if (focusedState.xValue !== null) {
    updateHoverAttributes(
      [
        attributesRef.current.xScale(focusedState.xValue),
        attributesRef.current.yScale(focusedState.yValue),
      ],
      true,
    );
  }
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
  const { height, width, margin } = visBoxRef.current;
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
    const formattedValue = Math.round(xAxisTickValue * 10e9) / 10e9;
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
    const formattedValue = Math.round(yAxisTickValue * 10e9) / 10e9;
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
