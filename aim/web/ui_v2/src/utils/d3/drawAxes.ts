import * as d3 from 'd3';

import { IDrawAxesProps } from 'types/utils/d3/drawAxes';
import { XAlignmentEnum } from './index';
import { AlignmentOptions } from 'config/alignment/alignmentOptions';

function drawAxes(props: IDrawAxesProps): void {
  const {
    svgNodeRef,
    axesNodeRef,
    axesRef,
    plotBoxRef,
    xScale,
    yScale,
    width,
    height,
    margin,
    alignmentConfig,
  } = props;

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  let xAlignmentText = '';
  switch (alignmentConfig?.type) {
    case AlignmentOptions.EPOCH:
      xAlignmentText = XAlignmentEnum.Epoch + 's';

      // const ticksCount = Math.floor(plotBoxRef.current.width / 50);
      // const delta = Math.floor(xTicks.length / ticksCount);
      // const ticks =
      //   delta > 1 ? xTicks.filter((_, i) => i % delta === 0) : xTicks;
      //
      // xAxis
      //   .tickValues(ticks.map((tick) => tick[0]))
      //   .tickFormat((d, i) => ticks[i][1]);
      break;
    case AlignmentOptions.RELATIVE_TIME:
      xAlignmentText = XAlignmentEnum.RelativeTime.replace('_', ' ');
      // xAxis
      //     .ticks(ticksCount)
      //     .tickValues(tickValues)
      //     .tickFormat((d, i) =>
      //         shortEnglishHumanizer(Math.round(+d * 1000), humanizerConfig.current),
      //     );
      break;
    case AlignmentOptions.ABSOLUTE_TIME:
      xAlignmentText = XAlignmentEnum.AbsoluteTime.replace('_', ' ');
      // let ticksCount = Math.floor(plotBoxRef.current.width / 120);
      // ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
      // const tickValues = _.range(...chartOptions.current.xScale.domain());
      //
      // xAxisTicks
      //     .ticks(ticksCount > 1 ? ticksCount - 1 : 1)
      //     .tickValues(
      //         tickValues.filter((v, i) => {
      //           if (i === 0 || i === tickValues.length - 1) {
      //             return true;
      //           }
      //           const interval = Math.floor(
      //               (tickValues.length - 2) / (ticksCount - 2),
      //           );
      //           return i % interval === 0 && tickValues.length - interval > i;
      //         }),
      //     )
      //     .tickFormat((d, i) => moment.unix(d).format('HH:mm:ss D MMM, YY'));
      break;
    case AlignmentOptions.CUSTOM_METRIC:
      xAlignmentText = alignmentConfig?.metric.replace('_', ' ');
      break;
    default:
      xAlignmentText = XAlignmentEnum.Step + 's';
      const ticksCount = Math.floor(plotBoxRef.current.width / 50);
      xAxis.ticks(ticksCount > 1 ? ticksCount - 1 : 1);
  }

  axesRef.current.xAxis = axesNodeRef.current
    .append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0, ${plotBoxRef.current.height})`)
    .call(xAxis);

  axesRef.current.yAxis = axesNodeRef.current
    .append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  svgNodeRef.current
    .append('text')
    .attr('transform', `translate(${width - 20},${height - margin.bottom - 5})`)
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'ideographic')
    .style('font-size', '0.7em')
    .style('text-transform', 'capitalize')
    .style('fill', '#586069') // var(--grey)
    .text(xAlignmentText);

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
