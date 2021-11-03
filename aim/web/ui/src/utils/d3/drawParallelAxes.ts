import _ from 'lodash-es';
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
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';

function drawParallelAxes({
  axesNodeRef,
  visBoxRef,
  attributesRef,
  axesRef,
  dimensions,
  plotBoxRef,
}: IDrawParallelAxesProps): void {
  if (!axesNodeRef?.current && !dimensions && _.isEmpty(dimensions)) {
    return;
  }
  const keysOfDimensions = Object.keys(dimensions);
  const { width, height, margin } = visBoxRef.current;
  const xScale = getAxisScale({
    domainData: keysOfDimensions,
    rangeData: [0, width - margin.left - margin.right],
    scaleType: ScaleEnum.Point,
  });
  axesRef.current.yAxes = {};

  const yScale: YScaleType = {};

  function getFormattedYAxis(yScale: d3.AxisScale<d3.AxisDomain>) {
    const yAxis = d3.axisLeft(yScale);
    const ticksCount = Math.floor(plotBoxRef.current.height / 20);
    yAxis.ticks(ticksCount > 3 ? (ticksCount < 20 ? ticksCount : 20) : 3);
    return yAxis;
  }

  keysOfDimensions.forEach((keyOfDimension: string, i: number) => {
    const { domainData, scaleType, displayName, dimensionType } =
      dimensions[keyOfDimension];
    const first = 0;
    const last = keysOfDimensions.length - 1;

    const tmpYScale = getAxisScale({
      domainData,
      scaleType,
      rangeData: [height - margin.top - margin.bottom, 0],
    });
    yScale[keyOfDimension] = tmpYScale;
    const tickWidth = i === first ? 40 : plotBoxRef.current.width / last - 20;
    const titleWidth = plotBoxRef.current.width / last;

    const yAxis = getFormattedYAxis(tmpYScale);
    const axes = axesNodeRef.current
      ?.append('g')
      .attr('class', 'Axis')
      .data([keyOfDimension])
      .attr('stroke-width', 0.6)
      .attr('transform', `translate(${xScale(keyOfDimension)})`)
      .call(yAxis);

    axes
      .selectAll('.tick')
      .append('foreignObject')
      .attr('x', -tickWidth - 10)
      .attr('y', -8)
      .attr('height', 12)
      .attr('width', tickWidth)
      .html(
        (d: string) =>
          `<div style='width: ${tickWidth}px' class='yAxisLabel' title='${d}'>${d}</div>`,
      );

    const dimensionTitleWidth =
      i === first || i === last ? titleWidth : titleWidth * 2;

    axes
      .append('foreignObject')
      .attr('width', dimensionTitleWidth)
      .attr('height', 20)
      .attr(
        'transform',
        `translate(${
          i === first
            ? 0
            : i === last
            ? -dimensionTitleWidth
            : -dimensionTitleWidth / 2
        }, ${i % 2 === 0 ? -25 : -40})`,
      )
      .html(() => {
        let [label1, label2 = ''] = displayName.split(' ');
        const styledLabel2 = label2
          ? `<span style='font-style: italic'>${label2}</span>`
          : '';
        let label = isSystemMetric(label1)
          ? formatSystemMetricName(label1)
          : label1;
        return `
            <div title='${displayName}'
                class='xAxisLabel__container xAxisLabel__container__${dimensionType} 
                ${i === first ? 'left' : i === last ? 'right' : ''}' 
            >
               <div class='xAxisLabel'>${label} ${styledLabel2}</div>
            </div>
          `;
      });

    axesRef.current.yAxes[keyOfDimension] = axes;
  });

  attributesRef.current.xScale = xScale;
  attributesRef.current.yScale = yScale;
  const lastYScale =
    attributesRef.current.yScale[keysOfDimensions[keysOfDimensions.length - 1]];
  const range = lastYScale?.range();
  if (range) {
    attributesRef.current.yColorIndicatorScale = d3
      .scaleSequential()
      .domain(range)
      .interpolator(d3.interpolateRgb(gradientStartColor, gradientEndColor));
  }
}

export default drawParallelAxes;
