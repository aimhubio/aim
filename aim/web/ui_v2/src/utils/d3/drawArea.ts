import * as d3 from 'd3';

import { IDrawAreaProps } from 'types/utils/d3/drawArea';
import { CircleEnum } from './index';

function drawArea(props: IDrawAreaProps): void {
  const {
    index = 0,
    parentRef,
    visAreaRef,
    svgRef,
    bgRectRef,
    visBoxRef,
    plotRef,
    axesRef,
    plotBoxRef,
    linesRef,
    attributesRef,
  } = props;

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

  visArea.style('width', '100%').style('height', '100%');

  svgRef.current = visArea
    .append('svg')
    .attr('id', 'svg-area')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  bgRectRef.current = svgRef.current
    .append('rect')
    .attr('x', margin.left)
    .attr('class', 'backgroundRect')
    .attr('y', margin.top)
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom)
    .style('fill', 'transparent');

  plotRef.current = svgRef.current
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  axesRef.current = plotRef.current.append('g').attr('class', 'Axes');

  linesRef.current = plotRef.current.append('g').attr('class', 'Lines');

  linesRef.current
    .append('clipPath')
    .attr('id', 'lines-rect-clip-' + index)
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom);

  attributesRef.current = plotRef.current
    .append('g')
    .attr('class', 'Attributes');

  attributesRef.current
    .append('clipPath')
    .attr('id', 'circles-rect-clip-' + index)
    .append('rect')
    .attr('x', -7)
    .attr('y', 0)
    .attr(
      'width',
      width - margin.left - margin.right + 2 * CircleEnum.ActiveRadius,
    )
    .attr('height', height - margin.top - margin.bottom);
}

export default drawArea;
