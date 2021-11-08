import * as d3 from 'd3';

import { IDrawAreaArgs } from 'types/utils/d3/drawArea';

import { CircleEnum } from './index';

function drawParallelArea(args: IDrawAreaArgs): void {
  const {
    index = 0,
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
    width - margin.left - margin.right >= 0
      ? width - margin.left - margin.right
      : 0;

  visArea.style('width', `${width}px`).style('height', `${height}px`);

  svgNodeRef.current = visArea
    .append('svg')
    .attr('id', 'svg-area')
    .attr('width', `${width}px`)
    .attr('height', `${height}px`)
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  bgRectNodeRef.current = svgNodeRef.current
    .append('rect')
    .attr('x', margin.left)
    .attr('class', 'backgroundRect')
    .attr('y', margin.top)
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
    .attr('id', 'lines-rect-clip-' + index)
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
    .attr('id', 'circles-rect-clip-' + index)
    .append('rect')
    .attr('x', -7)
    .attr('y', -7)
    .attr('width', offsetWidth + 2 * CircleEnum.ActiveRadius + 4)
    .attr('height', offsetHeight + 2 * CircleEnum.ActiveRadius + 4);

  const titleMarginTop = 2;
  const titleHeight = 15;
  const keys = Object.keys(chartTitle);
  const titleText = keys
    ? `${keys.map((key) => `${key}=${chartTitle[key]}`).join(', ')}`
    : '';

  if (titleText) {
    svgNodeRef.current
      .append('foreignObject')
      .attr('x', 0)
      .attr('y', titleMarginTop)
      .attr('height', titleHeight)
      .attr('width', width)
      .html((d: any) => {
        return keys.length
          ? `
        <div 
            title='#${index + 1} ${titleText}' 
            style='
              display: flex; 
              align-items: center;
              justify-content: center;
              color: #484f56;
              padding: 0 1em;
            '
        >
          <div 
            style='
              width: ${titleHeight}px; 
              height: ${titleHeight}px;
              display: flex; 
              align-items: center;
              justify-content: center;
              margin-right: 0.5em;
              padding: 2px;
              box-shadow: inset 0 0 0 1px #e8e8e8;
              border-radius: 0.2em;
              font-size: 0.6em;
              flex-shrink: 0;
            '
          >
           ${index + 1}
          </div>
          <div 
            style='
              white-space: nowrap; 
              text-overflow: ellipsis;
              overflow: hidden;
              font-size: 0.75em;
            '
          >
            ${titleText}
          </div>
        </div>
      `
          : '';
      });
  }
}
export default drawParallelArea;
