import * as d3 from 'd3';
import {
  IDrawParallelAxesProps,
  YScaleType,
} from 'types/utils/d3/drawParallelAxes';
import { getAxesScale, ScaleEnum } from 'utils/d3';

function drawParallelAxes(params: IDrawParallelAxesProps): void {
  const { axesNodeRef, visBoxRef, attributesRef, dimensions } = params;
  const keysOfDimensions = Object.keys(dimensions);
  const { width, height, margin } = visBoxRef.current;
  const xScale = getAxesScale({
    domainData: keysOfDimensions,
    rangeData: [0, width - margin.left - margin.right],
    scaleType: ScaleEnum.Point,
  });

  const yScale: YScaleType = {};

  keysOfDimensions.forEach((keyOfDimension: string, i: number) => {
    const tmpYScale = getAxesScale({
      domainData: dimensions[keyOfDimension].domainData,
      scaleType: dimensions[keyOfDimension].scaleType,
      rangeData: [height - margin.top - margin.bottom, 0],
    });
    yScale[keyOfDimension] = tmpYScale;
    const tickWidth = i === 0 ? 40 : width / keysOfDimensions.length - 10;
    const axes = axesNodeRef.current
      .append('g')
      .data([keyOfDimension])
      .attr('transform', `translate(${xScale(keyOfDimension)})`)
      .call(d3.axisLeft(tmpYScale));
    axes
      .selectAll('.tick')
      .append('foreignObject')
      .attr('x', -tickWidth + 10)
      .attr('y', -8)
      .attr('height', 12)
      .attr('width', tickWidth)
      .html(
        (d: string) =>
          `<div style='width: ${
            tickWidth - 20
          }px' class='yAxis__text' title='${d}'>${d}</div>`,
      );

    axes
      .append('foreignObject')
      .attr('width', 160)
      .attr('height', 160)
      .attr('transform', 'translate(0, -30)')
      .html(() => {
        return `
        <div>
          <p>${keyOfDimension}</p>
        </div>`;
      });
  });

  attributesRef.current.xScale = xScale;
  attributesRef.current.yScale = yScale;
}

export default drawParallelAxes;
