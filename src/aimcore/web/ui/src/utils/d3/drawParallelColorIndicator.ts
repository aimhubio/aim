import { IDrawParallelColorIndicator } from 'types/utils/d3/drawParallelColorIndicator';

import { gradientStartColor, gradientEndColor } from './index';

function drawParallelColorIndicator({
  index,
  plotBoxRef,
  plotNodeRef,
}: IDrawParallelColorIndicator): void {
  const linearGradientNode = plotNodeRef.current
    .append('linearGradient')
    .attr('id', `ParCoordsGradient-${index}`)
    .attr('class', 'ParCoordsGradient')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 1)
    .lower();

  linearGradientNode
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', gradientEndColor);

  linearGradientNode
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', gradientStartColor);

  plotNodeRef.current
    .append('rect')
    .attr('class', 'ParCoordsGradient__rect')
    .attr('x', plotBoxRef.current.width + 1)
    .attr('y', 0)
    .attr('width', 15)
    .attr('height', plotBoxRef.current.height)
    .attr('stroke', '#777')
    .attr('stroke-width', 1)
    .attr('fill', `url(#ParCoordsGradient-${index})`)
    .lower();
}

export default drawParallelColorIndicator;
