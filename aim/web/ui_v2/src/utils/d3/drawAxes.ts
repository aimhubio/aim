import * as d3 from 'd3';

import { IDrawAxesProps } from 'types/utils/d3/drawAxes';

function drawAxes(props: IDrawAxesProps): void {
  const { axesRef, plotBoxRef, xScale, yScale } = props;

  const x_axis = d3.axisBottom(xScale);
  const y_axis = d3.axisLeft(yScale);

  axesRef.current
    .append('g')
    .attr('class', 'xAxis')
    .call(x_axis)
    .attr('transform', `translate(0, ${plotBoxRef.current.height})`);

  axesRef.current.append('g').attr('class', 'yAxis').call(y_axis);
}

export default drawAxes;
