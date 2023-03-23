import * as d3 from 'd3';

import { IDrawAreaArgs } from 'types/utils/d3/drawArea';

import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import { isSystemMetric } from 'utils/isSystemMetric';
import { toTextEllipsis } from 'utils/helper';

import { CircleEnum } from './index';

function drawArea(args: IDrawAreaArgs): void {
  const {
    index,
    id,
    nameKey,
    parentRef,
    visAreaRef,
    svgNodeRef,
    bgRectNodeRef,
    visBoxRef,
    plotNodeRef,
    axesNodeRef,
    plotBoxRef,
    linesNodeRef,
    attributesNodeRef,
    chartTitle = {},
  } = args;

  if (!parentRef?.current || !visAreaRef?.current) {
    return;
  }

  const parent = d3.select(parentRef.current);
  const visArea = d3.select(visAreaRef.current);

  const parentRect = parent.node().getBoundingClientRect();

  const { width, height } = parentRect;
  const { margin } = visBoxRef.current;

  // set visual box dimensions
  visBoxRef.current = {
    ...visBoxRef.current,
    width,
    height,
  };

  // set plot box dimensions
  plotBoxRef.current = {
    ...plotBoxRef.current,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const offsetWidth =
    width - margin.left - margin.right >= 0
      ? width - margin.left - margin.right
      : 0;

  const offsetHeight =
    height - margin.top - margin.bottom >= 0
      ? height - margin.top - margin.bottom
      : 0;

  visArea.style('width', `${width}px`).style('height', `${height}px`);

  svgNodeRef.current = visArea
    .append('svg')
    .attr('class', 'Visualization')
    .attr('id', `${nameKey}-svg-area-${id}`)
    .attr('width', `${width}px`)
    .attr('height', `${height}px`)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .style('fill', 'transparent');

  bgRectNodeRef.current = svgNodeRef.current
    .append('rect')
    .attr('x', margin.left)
    .attr('y', margin.top)
    .attr('class', 'backgroundRect')
    .attr('width', offsetWidth)
    .attr('height', offsetHeight)
    .style('fill', 'transparent');

  plotNodeRef.current = svgNodeRef.current
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  axesNodeRef.current = plotNodeRef.current.append('g').attr('class', 'Axes');
  linesNodeRef.current = plotNodeRef.current.append('g').attr('class', 'Lines');

  linesNodeRef.current
    .append('clipPath')
    .attr('id', `${nameKey}-lines-rect-clip-${id}`)
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', offsetWidth)
    .attr('height', offsetHeight);

  attributesNodeRef.current = plotNodeRef.current
    .append('g')
    .attr('class', 'Attributes');

  attributesNodeRef.current
    .append('clipPath')
    .attr('id', `${nameKey}-circles-rect-clip-${id}`)
    .append('rect')
    .attr('x', -CircleEnum.Radius)
    .attr('y', -CircleEnum.Radius)
    .attr('width', offsetWidth + 2 * CircleEnum.Radius)
    .attr('height', offsetHeight + 2 * CircleEnum.Radius);

  const titleText = Object.entries(chartTitle || {})
    .map(
      ([key, value]) =>
        `${key}=${
          isSystemMetric(value) ? formatSystemMetricName(value) : value
        }`,
    )
    .join(', ');

  const title = {
    x: margin.left / 6,
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    chartIndex: {
      fontFamily: 'Inconsolata, monospace',
    },
  };
  const textEllipsis = toTextEllipsis({
    text: titleText,
    width: title.x + offsetWidth,
    fontSize: `${title.fontSize}px`,
    fontFamily: title.fontFamily,
    fontWeight: title.fontWeight,
  });
  if (titleText) {
    const titleGroup = svgNodeRef.current
      .append('g')
      .attr('transform', `translate(${title.x}, 3)`)
      .attr('font-size', `${title.fontSize}px`)
      .attr('font-weight', title.fontWeight)
      .attr('font-family', title.fontFamily);

    if (index || index === 0) {
      titleGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 12)
        .attr('fill', '#484f56')
        .style('outline', '1px solid #dee6f3')
        .style('border-radius', '1px')
        .style('white-space', 'pre')
        .text(` ${index + 1} `)
        .style('font-family', title.chartIndex.fontFamily);
    }

    titleGroup
      .append('text')
      .attr('x', title.x + 39)
      .attr('y', 12)
      .attr('fill', '#484f56')
      .text(textEllipsis)
      .append('svg:title')
      .text(titleText);
  }
}

export default drawArea;
