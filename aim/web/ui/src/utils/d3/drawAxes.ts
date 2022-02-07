import * as d3 from 'd3';
import _ from 'lodash-es';
import { Unit } from 'humanize-duration';
import moment from 'moment';

import { IDrawAxesArgs } from 'types/utils/d3/drawAxes';

import shortEnglishHumanizer from 'utils/shortEnglishHumanizer';

import { getKeyByAlignment } from '../formatByAlignment';

import { AlignmentOptionsEnum } from './index';

function drawAxes(args: IDrawAxesArgs): void {
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
    humanizerConfigRef,
    drawBgTickLines = {
      x: false,
      y: false,
    },
  } = args;

  if (!axesNodeRef?.current || !axesRef?.current || !svgNodeRef?.current) {
    return;
  }

  function getFormattedXAxis(xScale: d3.AxisScale<d3.AxisDomain>) {
    let xAxis = d3.axisBottom(xScale);
    let xAlignmentText = '';
    const domainData = xScale.domain();
    const first: any = domainData[0];
    const last: any = domainData[domainData.length - 1];

    let ticksCount = Math.floor(plotBoxRef.current.width / 90);
    ticksCount = ticksCount > 3 ? (ticksCount < 10 ? ticksCount : 10) : 3;
    xAxis.ticks(ticksCount);
    if (domainData.length - 1 > ticksCount) {
      const tickValues = domainData.filter(
        (v, i, arr) => i % Math.ceil((arr.length - 1) / ticksCount) === 0,
      );
      xAxis.tickValues(tickValues);
    }

    const alignmentKey = _.capitalize(getKeyByAlignment(alignmentConfig));
    switch (alignmentConfig?.type) {
      case AlignmentOptionsEnum.STEP:
        xAlignmentText = alignmentKey ? alignmentKey + 's' : 'Steps';

        ticksCount = Math.floor(plotBoxRef.current.width / 90);
        ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
        xAxis.ticks(ticksCount);
        break;
      case AlignmentOptionsEnum.EPOCH:
        {
          xAlignmentText = alignmentKey ? alignmentKey + 's' : '';

          ticksCount = Math.floor(plotBoxRef.current.width / 50);
          ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;

          const tickValues = xScale.domain().filter((x) => {
            if (typeof x === 'number') {
              return Math.round(x) - x === 0;
            }
            return true;
          });

          xAxis.ticks(ticksCount).tickValues(tickValues);
        }
        break;
      case AlignmentOptionsEnum.RELATIVE_TIME:
        {
          xAlignmentText = alignmentKey || '';

          ticksCount = Math.floor(plotBoxRef.current.width / 85);
          ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
          const minute = 60;
          const hour = 60 * minute;
          const day = 24 * hour;
          const week = 7 * day;

          const diff = Math.ceil((last - first) / 1000);
          let unit: number | null = null;
          let formatUnit: Unit;
          if (diff / week > 4) {
            unit = week;
            formatUnit = 'w';
          } else if (diff / day > 3) {
            unit = day;
            formatUnit = 'd';
          } else if (diff / hour > 3) {
            unit = hour;
            formatUnit = 'h';
          } else if (diff / minute > 4) {
            unit = minute;
            formatUnit = 'm';
          } else {
            unit = null;
            formatUnit = 's';
          }

          let tickValues: null | number[] = unit === null ? null : [];

          if (tickValues !== null) {
            const d = Math.floor((last - first) / (ticksCount - 1));
            for (let i = 0; i < ticksCount; i++) {
              if (i === ticksCount - 1) {
                tickValues.push(Math.ceil(last + 1));
              } else {
                tickValues.push(Math.floor(first + i * d));
              }
            }
          }

          if (unit !== null && tickValues && ticksCount < tickValues.length) {
            tickValues = tickValues.filter((v, i) => {
              if (i === 0 || i === tickValues!.length - 1) {
                return true;
              }
              const interval = Math.floor(
                (tickValues!.length - 2) / (ticksCount - 2),
              );
              return i % interval === 0 && tickValues!.length - interval > i;
            });
          }

          humanizerConfigRef.current = {
            units: [formatUnit],
            maxDecimalPoints: 2,
          };

          xAxis
            .ticks(ticksCount)
            .tickValues(tickValues!)
            .tickFormat((d, i) =>
              shortEnglishHumanizer(Math.round(+d), humanizerConfigRef.current),
            );
        }
        break;
      case AlignmentOptionsEnum.ABSOLUTE_TIME:
        {
          xAlignmentText = alignmentKey || '';

          ticksCount = Math.floor(plotBoxRef.current.width / 120);
          ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
          let tickValues: number[] = [];
          const d = (last - first) / (ticksCount - 1);
          for (let i = 0; i < ticksCount; i++) {
            if (i === ticksCount - 1) {
              tickValues.push(Math.ceil(last));
            } else {
              tickValues.push(Math.floor(first + i * d));
            }
          }

          xAxis
            .ticks(ticksCount)
            .tickValues(
              tickValues.filter((v, i) => {
                if (i === 0 || i === tickValues.length - 1) {
                  return true;
                }
                const interval = Math.floor(
                  (tickValues.length - 2) / (ticksCount - 2),
                );
                return i % interval === 0 && tickValues.length - interval > i;
              }),
            )
            .tickFormat((d) => moment(+d).format('HH:mm:ss D MMM, YY'));
        }
        break;
      case AlignmentOptionsEnum.CUSTOM_METRIC:
        xAlignmentText = alignmentConfig?.metric || '';
        ticksCount = Math.floor(plotBoxRef.current.width / 120);
        ticksCount = ticksCount > 1 ? ticksCount - 1 : 1;
        xAxis.ticks(ticksCount);
        break;
    }

    if (drawBgTickLines.x) {
      xAxis.tickSize(-height + (margin.top + margin.bottom)).tickSizeOuter(0);
    }
    return { xAlignmentText, xAxis };
  }

  function getFormattedYAxis(yScale: d3.AxisScale<d3.AxisDomain>) {
    const yAxis = d3.axisLeft(yScale);
    let ticksCount = Math.floor(plotBoxRef.current.height / 50);
    ticksCount = ticksCount > 3 ? (ticksCount < 20 ? ticksCount : 20) : 3;
    yAxis.ticks(ticksCount);
    if (yScale.domain().length > ticksCount) {
      const ticks = yScale
        .domain()
        .filter((v, i, arr) => i % Math.ceil(arr.length / ticksCount) === 0);
      yAxis.tickValues(ticks);
    }

    if (drawBgTickLines.y) {
      yAxis.tickSize(-width + (margin.left + margin.right)).tickSizeOuter(0);
    }
    return yAxis;
  }

  const yAxis = getFormattedYAxis(yScale);

  const { xAlignmentText, xAxis } = getFormattedXAxis(xScale);

  axesRef.current.xAxis = axesNodeRef.current
    ?.append('g')
    .attr('class', 'xAxis')
    .attr('stroke-width', 0.2)
    .attr('color', '#8E9BAE')
    .attr('fill', 'none')
    .attr('transform', `translate(0, ${plotBoxRef.current.height})`)
    .call(xAxis);

  let xTickWidth = Math.floor(
    plotBoxRef.current.width /
      axesRef.current.xAxis.selectAll('.tick').nodes().length -
      1,
  );
  xTickWidth = xTickWidth > 120 ? 120 : xTickWidth < 0 ? 0 : xTickWidth;

  axesRef.current.xAxis
    .selectAll('.tick')
    .append('foreignObject')
    .attr('x', -xTickWidth / 2)
    .attr('y', 8)
    .attr('height', 12)
    .attr('width', xTickWidth)
    .html((d: string, i: number, nodes: NodeList) => {
      const text = nodes[i]?.parentNode as SVGElement;
      const textContent = text?.textContent || d;
      return `<div style='width: ${xTickWidth}px' class='xAxisTick' title='${textContent}'>${textContent}</div>`;
    });

  axesRef.current.yAxis = axesNodeRef.current
    ?.append('g')
    .attr('class', 'yAxis')
    .attr('stroke-width', 0.2)
    .attr('color', '#8E9BAE')
    .attr('fill', 'none')
    .call(yAxis);

  const yTickWidth = margin.left - 10;

  axesRef.current.yAxis
    .selectAll('.tick')
    .append('foreignObject')
    .attr('x', -yTickWidth - 10)
    .attr('y', -8)
    .attr('height', 12)
    .attr('width', yTickWidth)
    .html((d: string, i: number, nodes: NodeList) => {
      const text = nodes[i]?.parentNode as SVGElement;
      const textContent = text?.textContent || d;
      return `<div style='width: ${50}px' class='yAxisTick' title='${textContent}'>${textContent}</div>`;
    });

  svgNodeRef.current
    .append('text')
    .attr('transform', `translate(${width - 20},${height - margin.bottom - 5})`)
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'ideographic')
    .style('font-size', '0.7em')
    .style('fill', '#586069')
    .text(xAlignmentText)
    .lower();

  axesRef.current.updateXAxis = function (
    xScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    const { xAxis } = getFormattedXAxis(xScaleUpdate);
    axesRef.current.xAxis.call(xAxis);
  };

  axesRef.current.updateYAxis = function (
    yScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    const yAxis = getFormattedYAxis(yScaleUpdate);
    axesRef.current.yAxis.call(yAxis);
  };
}

export default drawAxes;
