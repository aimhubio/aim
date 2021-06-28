import * as d3 from 'd3';

import { IDrawAxes } from '../../types/utils/d3/drawAxes';

function drawAxes(props: IDrawAxes): void {
  const { axesRef, plotBoxRef, visBoxRef, xMin, xMax, yMin, yMax } = props;

  const { width, height, margin } = visBoxRef.current;

  // X-Axes
  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([0, width - margin.left - margin.right]);

  const x_axis = d3.axisBottom(xScale);

  axesRef.current
    .append('g')
    .attr('class', 'xAxis')
    .call(x_axis)
    .attr('transform', `translate(0, ${plotBoxRef.current.height})`);

  // Y-Axes
  const yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin.top - margin.bottom, 0]);

  const y_axis = d3.axisLeft(yScale);

  axesRef.current.append('g').attr('class', 'yAxis').call(y_axis);
}

export default drawAxes;
