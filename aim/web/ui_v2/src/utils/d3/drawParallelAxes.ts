import * as d3 from 'd3';
import {
  IDrawParallelAxesProps,
  YScaleType,
} from 'types/utils/d3/drawParallelAxes';
import {
  getAxisScale,
  ScaleEnum,
  gradientStartColor,
  gradientEndColor,
} from 'utils/d3';

function drawParallelAxes({
  axesNodeRef,
  visBoxRef,
  attributesRef,
  axesRef,
  dimensions,
}: IDrawParallelAxesProps): void {
  const keysOfDimensions = Object.keys(dimensions);
  const { width, height, margin } = visBoxRef.current;
  const xScale = getAxisScale({
    domainData: keysOfDimensions,
    rangeData: [0, width - margin.left - margin.right],
    scaleType: ScaleEnum.Point,
  });
  axesRef.current.yAxes = {};

  const yScale: YScaleType = {};

  keysOfDimensions.forEach((keyOfDimension: string, i: number) => {
    const tmpYScale = getAxisScale({
      domainData: dimensions[keyOfDimension].domainData,
      scaleType: dimensions[keyOfDimension].scaleType,
      rangeData: [height - margin.top - margin.bottom, 0],
    });
    yScale[keyOfDimension] = tmpYScale;
    const tickWidth = i === 0 ? 40 : width / keysOfDimensions.length - 10;
    const axes = axesNodeRef.current
      .append('g')
      .attr('class', 'Axis')
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
    axesRef.current.yAxes[keyOfDimension] = axes;
  });

  attributesRef.current.xScale = xScale;
  attributesRef.current.yScale = yScale;
  const lastYScale =
    attributesRef.current.yScale[keysOfDimensions[keysOfDimensions.length - 1]];
  const range = lastYScale.range();
  attributesRef.current.yColorIndicatorScale = d3
    .scaleSequential()
    .domain(range)
    .interpolator(d3.interpolateRgb(gradientStartColor, gradientEndColor));
}

export default drawParallelAxes;
