import * as d3 from 'd3';

import { IDrawAxesProps } from 'types/utils/d3/drawAxes';

function drawAxes(props: IDrawAxesProps): void {
  const { axesNodeRef, axesRef, plotBoxRef, xScale, yScale } = props;

  const x_axis = d3.axisBottom(xScale);
  const y_axis = d3.axisLeft(yScale);

  axesRef.current.xAxis = axesNodeRef.current
    .append('g')
    .attr('class', 'xAxis')
    .call(x_axis)
    .attr('transform', `translate(0, ${plotBoxRef.current.height})`);

  axesRef.current.yAxis = axesNodeRef.current
    .append('g')
    .attr('class', 'yAxis')
    .call(y_axis);

  axesRef.current.updateXAxis = function (
    xScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    axesRef.current.xAxis
      .transition()
      .duration(500)
      .call(d3.axisBottom(xScaleUpdate));
  };

  axesRef.current.updateYAxis = function (
    yScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    axesRef.current.yAxis
      .transition()
      .duration(500)
      .call(d3.axisLeft(yScaleUpdate));
  };
}

export default drawAxes;
