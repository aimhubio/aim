import * as d3 from 'd3';

import { IDrawAxesProps } from '../../types/utils/d3/drawAxes';

function drawAxes(props: IDrawAxesProps): void {
  const { axesRef, plotBoxRef, xScale, yScale } = props;

  const x_axis = d3.axisBottom(xScale);
  // .ticks(d3.timeDay.every(1))
  // .tickFormat(d3.timeFormat('%b %d'));
  const y_axis = d3.axisLeft(yScale);
  // .ticks(d3.timeDay.every(1))
  // .tickFormat(d3.timeFormat('%b %d'));

  axesRef.current
    .append('g')
    .attr('class', 'xAxis')
    .call(x_axis)
    .attr('transform', `translate(0, ${plotBoxRef.current.height})`);

  axesRef.current.append('g').attr('class', 'yAxis').call(y_axis);
}

export default drawAxes;
