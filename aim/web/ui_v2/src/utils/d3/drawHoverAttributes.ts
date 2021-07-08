import * as d3 from 'd3';

import { IDrawHoverAttributesProps } from '../../types/utils/d3/drawHoverAttributes';
import classes from './styles.module.css';
import { CircleEnum } from './index';
import { ILine } from '../../types/components/LineChart/LineChart';

function drawHoverAttributes(props: IDrawHoverAttributesProps): void {
  const {
    data,
    attributesRef,
    plotBoxRef,
    visAreaRef,
    visBoxRef,
    xScale,
    yScale,
  } = props;

  const { margin } = visBoxRef.current;
  const { height, width } = plotBoxRef.current;

  const svgArea = d3.select(visAreaRef.current).select('svg');

  svgArea?.on('mousemove', (event) => {
    const mouse: [number, number] = d3.pointer(event);
    const { mouseX, mouseY } = getCoordinates({
      mouse,
      xScale,
      yScale,
      margin,
    });

    // Closest xPoint for mouseX
    const xPoint = xScale.invert(mouseX);

    let nearestCircles: { x: number; y: number }[] = [];

    const closestCircle = {
      r: Infinity,
      x: 0,
      y: 0,
    };

    // Draw Circles
    attributesRef.current
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('class', 'HoverCircle')
      .attr('cx', (line: ILine, i: number) => {
        const index = d3.bisectCenter(line.data.xValues, xPoint);
        const closestXPoint = line.data.xValues[index];
        const closestXPixel = xScale(closestXPoint);

        nearestCircles = nearestCircles.concat([
          Object.assign(nearestCircles[i] || {}, {
            x: closestXPixel,
          }),
        ]);

        return closestXPixel;
      })
      .attr('cy', (line: ILine, i: number) => {
        const index = d3.bisectCenter(line.data.xValues, xPoint);
        const closestYPoint = line.data.yValues[index];
        const closestYPixel = yScale(closestYPoint);

        nearestCircles = nearestCircles.concat([
          Object.assign(nearestCircles[i] || {}, {
            y: closestYPixel,
          }),
        ]);

        return closestYPixel;
      })
      .attr('r', CircleEnum.Radius)
      .style('fill', (line: ILine) => line.color)
      .on('click', function () {
        // handlePointClick(
        //   closestStep,
        //   trace.runHash,
        //   trace.metricName,
        //   trace.traceContext,
        // );

        console.log('click', closestCircle);
        // analytics.trackEvent('[Explore] [LineChart] Line point click');
      });

    // Find closest circle
    // Better to find outside of the 'draw circle' cycle

    for (const circle of nearestCircles) {
      const rX = Math.abs(circle.x - mouseX);
      const rY = Math.abs(circle.y - mouseY);
      const r = Math.sqrt(Math.pow(rX, 2) + Math.pow(rY, 2));
      if (r < closestCircle.r) {
        Object.assign(closestCircle, {
          r,
          x: circle.x,
          y: circle.y,
        });
      }
    }

    // Remove hover lines
    attributesRef.current?.selectAll('line').remove();

    // Draw vertical hover line
    attributesRef.current
      .append('line')
      .attr('x1', closestCircle.x)
      .attr('y1', 0)
      .attr('x2', closestCircle.x)
      .attr('y2', height)
      .attr('class', classes.HoverLine)
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4 2')
      .style('fill', 'none');

    // Draw horizontal hover line
    attributesRef.current
      .append('line')
      .attr('x1', 0)
      .attr('y1', closestCircle.y)
      .attr('x2', width)
      .attr('y2', closestCircle.y)
      .attr('class', classes.HoverLine)
      .style('stroke-width', 1)
      .style('stroke-dasharray', '4 2')
      .style('fill', 'none');
  });

  svgArea?.on('mouseleave', (event) => {
    console.log('leave', event);
  });
}

function getCoordinates({
  mouse,
  margin,
  xScale,
  yScale,
}: {
  mouse: [number, number];
  margin: { left: number; top: number };
  xScale: IDrawHoverAttributesProps['xScale'];
  yScale: IDrawHoverAttributesProps['yScale'];
}): {
  mouseX: number;
  mouseY: number;
} {
  const xPixel = Math.floor(mouse[0]) - margin.left;
  const yPixel = Math.floor(mouse[1]) - margin.top;
  const [xMin, xMax] = xScale.range();
  const [yMax, yMin] = yScale.range();

  return {
    mouseX: xPixel < xMin ? xMin : xPixel > xMax ? xMax : xPixel,
    mouseY: yPixel < yMin ? yMin : yPixel > yMax ? yMax : yPixel,
  };
}

export default drawHoverAttributes;
