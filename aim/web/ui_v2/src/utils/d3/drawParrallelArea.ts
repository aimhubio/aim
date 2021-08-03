import * as d3 from 'd3';
import { IDrawAreaProps } from 'types/utils/d3/drawArea';
import { CircleEnum } from './index';
function drawParallelArea(props: IDrawAreaProps): void {
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
  svgNodeRef.current = visArea
    .append('svg')
    .attr('id', 'svg-area')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  bgRectNodeRef.current = svgNodeRef.current
    .append('rect')
    .attr('x', margin.left)
    .attr('class', 'backgroundRect')
    .attr('y', margin.top)
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom)
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
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom);
  attributesNodeRef.current = plotNodeRef.current
    .append('g')
    .attr('class', 'Attributes');
  attributesNodeRef.current
    .append('clipPath')
    .attr('id', 'circles-rect-clip-' + index)
    .append('rect')
    .attr('x', -7)
    .attr('y', -7)
    .attr(
      'width',
      width - margin.left - margin.right + 2 * CircleEnum.ActiveRadius + 4,
      // + circle-diameter(2 * CircleEnum.ActiveRadius) + stroke-width(4)
    )
    .attr(
      'height',
      height - margin.top - margin.bottom + 2 * CircleEnum.ActiveRadius + 4,
      // + circle-diameter(2 * CircleEnum.ActiveRadius) + stroke-width(4)
    );
}
export default drawParallelArea;
