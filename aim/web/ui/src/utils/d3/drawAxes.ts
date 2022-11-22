import * as d3 from 'd3';
import _ from 'lodash-es';
import moment from 'moment';

import { DATE_CHART_TICK } from 'config/dates/dates';

import { IDrawAxesArgs } from 'types/utils/d3/drawAxes';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

import {
  formatValueByAlignment,
  getKeyByAlignment,
} from 'utils/formatByAlignment';

import shortEnglishHumanizer from '../shortEnglishHumanizer';

import {
  formatXAxisByDefault,
  formatYAxisByDefault,
  IFormatAxis,
} from './tickFormatting';

import { AlignmentOptionsEnum, ScaleEnum } from './index';

function drawAxes(args: IDrawAxesArgs): void {
  const {
    svgNodeRef,
    axesNodeRef,
    axesRef,
    plotBoxRef,
    xScale,
    yScale,
    visBoxRef,
    alignmentConfig,
    axesScaleType,
    humanizerConfigRef,
    drawBgTickLines = {
      x: false,
      y: false,
    },
  } = args;

  if (
    !axesNodeRef?.current ||
    !axesRef?.current ||
    !svgNodeRef?.current ||
    !visBoxRef?.current
  ) {
    return;
  }

  const { width, height, margin } = visBoxRef.current;

  function formatByStep(args: IFormatAxis) {
    const { xAxis } = formatXAxisByDefault(args);
    return {
      xAxis,
      xAxisTitle: _.capitalize(getKeyByAlignment(alignmentConfig)) + 's',
    };
  }

  function formatByEpoch(args: IFormatAxis) {
    const { xAxis, ticksCount } = formatXAxisByDefault({
      ...args,
      tickAdditionalConfig: {
        minCount: 3,
      },
    });

    const { scale } = args;

    const domain = scale.domain();
    const first = domain[0] as number;
    const last = domain[domain.length - 1] as number;
    const distance = Math.ceil((last - first) / (ticksCount - 1));
    const tickValues: number[] = [];
    for (let i = 0; i < ticksCount; i++) {
      const current = Math.floor(first + i * distance);
      if (
        current >= first &&
        current <= last &&
        tickValues.indexOf(current) === -1
      ) {
        tickValues.push(current);
      }
    }

    xAxis.tickValues(tickValues);

    return {
      xAxis,
      xAxisTitle: _.capitalize(getKeyByAlignment(alignmentConfig)) + 's',
    };
  }

  function formatByRelativeTime(args: IFormatAxis) {
    let { xAxis, ticksCount, tickConfig, tickValues } = formatXAxisByDefault({
      ...args,
      tickAdditionalConfig: {
        distance: 120,
      },
    });

    const { scale } = args;

    const sec = 1;
    const minute = 60 * sec;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    const domain = scale.domain();
    const first = domain[0] as number;
    const last = domain[domain.length - 1] as number;

    const diff = Math.ceil((last - first) / 1000);
    let formatUnit: string;
    if (diff / week > 4) {
      formatUnit = 'w';
    } else if (diff / day > 3) {
      formatUnit = 'd';
    } else if (diff / hour > 3) {
      formatUnit = 'h';
    } else if (diff / minute > 4) {
      formatUnit = 'm';
    } else if (diff / sec > 4) {
      formatUnit = 's';
    } else {
      formatUnit = 'ms';
    }

    humanizerConfigRef.current = {
      units: [formatUnit],
      maxDecimalPoints: 4,
    };

    if (axesScaleType.xAxis === ScaleEnum.Log) {
      xAxis.tickValues(tickValues).tickFormat((d, i) =>
        _.truncate(
          shortEnglishHumanizer(d as number, humanizerConfigRef.current),
          {
            length: tickConfig.maxLength,
          },
        ),
      );
    } else {
      xAxis.ticks(ticksCount).tickFormat((d, i) =>
        _.truncate(
          shortEnglishHumanizer(d as number, humanizerConfigRef.current),
          {
            length: tickConfig.maxLength,
          },
        ),
      );
    }

    return {
      xAxis,
      xAxisTitle: _.capitalize(getKeyByAlignment(alignmentConfig)),
    };
  }

  function formatByAbsoluteTime(args: IFormatAxis) {
    const { xAxis, ticksCount, tickConfig } = formatXAxisByDefault({
      ...args,
      tickAdditionalConfig: {
        distance: 180,
        maxLength: 20,
      },
    });

    const { scale } = args;

    const domain = scale.domain();
    const first = domain[0] as number;
    const last = domain[domain.length - 1] as number;
    const distance = Math.ceil((last - first) / (ticksCount - 1));
    const tickValues: number[] = [];
    for (let i = 0; i < ticksCount; i++) {
      const lastRounded = Math.ceil(last);
      const current = Math.floor(first + i * distance);
      if (i === ticksCount - 1 && tickValues.indexOf(lastRounded) === -1) {
        tickValues.push(lastRounded);
      } else if (current < last) {
        tickValues.push(current);
      }
    }

    xAxis
      .ticks(ticksCount)
      .tickValues(tickValues)
      .tickFormat((d, i) =>
        _.truncate(moment(+d).format(DATE_CHART_TICK), {
          length: tickConfig.maxLength,
        }),
      );

    return {
      xAxis,
      xAxisTitle: _.capitalize(getKeyByAlignment(alignmentConfig)),
    };
  }

  function formatByCustomMetric(args: IFormatAxis) {
    const { xAxis } = formatXAxisByDefault(args);
    return {
      xAxis,
      xAxisTitle: getKeyByAlignment(alignmentConfig),
    };
  }

  function getFormattedXAxis(scale: d3.AxisScale<d3.AxisDomain>) {
    const formatters: { [key: string]: Function } = {
      [AlignmentOptionsEnum.STEP]: formatByStep,
      [AlignmentOptionsEnum.EPOCH]: formatByEpoch,
      [AlignmentOptionsEnum.RELATIVE_TIME]: formatByRelativeTime,
      [AlignmentOptionsEnum.ABSOLUTE_TIME]: formatByAbsoluteTime,
      [AlignmentOptionsEnum.CUSTOM_METRIC]: formatByCustomMetric,
      default: formatXAxisByDefault,
    };
    const formatter = formatters[alignmentConfig?.type || 'default'];
    return formatter({
      scale,
      drawTickLines: {
        ...drawBgTickLines,
        tickSize: -height + (margin.top + margin.bottom),
      },
      plotBoxRef,
      scaleType: axesScaleType,
    });
  }

  function getFormattedYAxis(scale: d3.AxisScale<d3.AxisDomain>) {
    const { yAxis } = formatYAxisByDefault({
      scale,
      drawTickLines: {
        ...drawBgTickLines,
        tickSize: -width + (margin.left + margin.right),
      },
      plotBoxRef,
      scaleType: axesScaleType,
    });
    return yAxis;
  }

  function drawYAxis(scale: IAxisScale): void {
    axesNodeRef.current?.select('.yAxis')?.remove();

    const yAxis = getFormattedYAxis(scale);
    const tickFontSize = 10;

    axesRef.current.yAxis = axesNodeRef.current
      ?.append('g')
      .attr('class', 'yAxis')
      .attr('stroke-width', 0.2)
      .attr('color', '#414b6d')
      .attr('fill', 'none')
      .call(yAxis)
      .attr('font-size', tickFontSize);

    axesRef.current.yAxis
      .select('.domain')
      .attr('stroke', '#414b6d')
      .attr('stroke-width', 0.4);

    const ticks = axesRef.current.yAxis.selectAll('.tick');

    ticks?.append('svg:title').text((d: string | number) => d);

    ticks?.select('line').attr('stroke', '#8E9BAE').attr('x1', '-6');

    if (!drawBgTickLines.y) {
      ticks
        ?.select('line')
        .attr('stroke', '#414b6d')
        .attr('stroke-width', 0.4)
        .attr('y2', '0.5');
    }
  }

  function drawXAxis(scale: IAxisScale): void {
    axesNodeRef.current?.select('.xAxis')?.remove();

    const { xAxisTitle, xAxis } = getFormattedXAxis(scale);
    const tickFontSize = 10;

    axesRef.current.xAxis = axesNodeRef.current
      ?.append('g')
      .attr('class', 'xAxis')
      .attr('stroke-width', 0.2)
      .attr('color', '#414b6d')
      .attr('fill', 'none')
      .attr('transform', `translate(0, ${plotBoxRef.current.height})`)
      .call(xAxis)
      .attr('font-size', tickFontSize);

    axesRef.current.xAxis
      .select('.domain')
      .attr('stroke', '#414b6d')
      .attr('stroke-width', 0.4);

    const ticks = axesRef.current.xAxis.selectAll('.tick');

    ticks?.append('svg:title').text((d: number) =>
      formatValueByAlignment({
        xAxisTickValue: d ?? null,
        type: alignmentConfig?.type,
      }),
    );

    ticks?.select('line').attr('stroke', '#8E9BAE').attr('y1', '6');

    if (!drawBgTickLines.x) {
      ticks
        ?.select('line')
        .attr('stroke', '#414b6d')
        .attr('stroke-width', 0.4)
        .attr('y2', '0.5');
    }

    axesRef.current.xAxis
      .append('text')
      .attr(
        'transform',
        `translate(${width - margin.left - margin.right - 20},-5)`,
      )
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'ideographic')
      .style('font-size', '1.1em')
      .style('fill', '#586069')
      .text(xAxisTitle);
  }

  drawYAxis(yScale);
  drawXAxis(xScale);

  axesRef.current.updateXAxis = function (
    xScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    drawXAxis(xScaleUpdate);
  };

  axesRef.current.updateYAxis = function (
    yScaleUpdate: d3.AxisScale<d3.AxisDomain>,
  ) {
    drawYAxis(yScaleUpdate);
  };
}

export default drawAxes;
