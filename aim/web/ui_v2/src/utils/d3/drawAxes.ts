import * as d3 from 'd3';

import { IDrawAxes, IDrawAxesProps } from '../../types/utils/d3/drawAxes';

function getScaleBaseFor(
  scaleType: IDrawAxesProps['xScaleType'] | IDrawAxesProps['yScaleType'],
) {
  switch (scaleType) {
    case 'log':
      return d3.scaleLog();
    case 'linear':
      return d3.scaleLinear();
    default:
      return d3.scaleLinear();
  }
}

function drawAxes(props: IDrawAxesProps): IDrawAxes {
  const {
    axesRef,
    plotBoxRef,
    visBoxRef,
    xMin,
    xMax,
    yMin,
    yMax,
    xAlignment,
    xScaleType,
    yScaleType,
  } = props;
  const { width, height, margin } = visBoxRef.current;

  const xScaleBase = getScaleBaseFor(xScaleType);
  const yScaleBase = getScaleBaseFor(yScaleType);

  // X-Scale
  const xScale = xScaleBase
    .domain([xMin, xMax])
    .range([0, width - margin.left - margin.right]);

  // Y-Scale
  const yScale = yScaleBase
    .domain([yMin, yMax])
    .range([height - margin.top - margin.bottom, 0]);

  const x_axis = d3.axisBottom(xScale);
  const y_axis = d3.axisLeft(yScale);

  axesRef.current
    .append('g')
    .attr('class', 'xAxis')
    .call(x_axis)
    .attr('transform', `translate(0, ${plotBoxRef.current.height})`);

  axesRef.current.append('g').attr('class', 'yAxis').call(y_axis);

  return { xScale, yScale };
}

export default drawAxes;
