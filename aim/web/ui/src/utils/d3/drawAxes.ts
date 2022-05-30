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

  function getLogScaleAttributes(
    scale: d3.AxisScale<d3.AxisDomain>,
    ticksCount: number = 10,
    precision: number = 2,
  ) {
    let [min, max] = scale.domain() as number[];
    if (min === 0) {
      // TODO calculate 'logMin' dep. on 'max' value
      let logMin = 0.00001;
      min = logMin;
    }
    const logScale = d3.scaleLog().domain([min, max]);
    const format = logScale.tickFormat(10);
    let ticks = logScale.ticks(ticksCount).filter(format);
    if (ticks.length > ticksCount) {
      ticks = ticks.filter((v, i, arr) => {
        if (i === 0 || i === arr.length - 1) {
          return true;
        }
        const interval = Math.floor((arr.length - 2) / (ticksCount - 2));
        return i % interval === 0 && arr.length - interval > i;
      });
    }

    const specifier = d3.formatSpecifier('.' + precision + '~g');
    return { ticks, specifier };
  }

  function customFormatting(
    value: d3.AxisDomain,
    tickConfig: {
      defaultFormatMaxLength: number;
      precision: number;
      maxLength: number;
      omission: string;
    },
  ) {
    let tick = value.toString();
    if (
      typeof value === 'number' &&
      tick.length > tickConfig.defaultFormatMaxLength
    ) {
      tick = d3.format('.' + tickConfig.precision + '~g')(value);
    }
    return _.truncate(tick, {
      length: tickConfig.maxLength,
      omission: tickConfig.omission,
    });
  }

  function formatXAxisByDefault(
    scale: d3.AxisScale<d3.AxisDomain>,
    tickAdditionalConfig = {},
  ) {
    const tickConfig = {
      distance: 90,
      minCount: 3,
      maxCount: 20,
      precision: { log: 4, linear: 3 },
      maxLength: 14,
      omission: '..',
      defaultFormatMaxLength: 6,
      padding: 10,
      tickSizeInner: 0,
      ...tickAdditionalConfig,
    };

    const xAxis = d3
      .axisBottom(scale)
      .tickPadding(tickConfig.padding)
      .tickSizeInner(tickConfig.tickSizeInner);

    if (drawBgTickLines.x) {
      const tickSize = -height + (margin.top + margin.bottom);
      const tickSizeOuter = 0;
      xAxis.tickSize(tickSize).tickSizeOuter(tickSizeOuter);
    }

    let ticksCount = _.clamp(
      Math.floor(plotBoxRef.current.width / tickConfig.distance),
      tickConfig.minCount,
      tickConfig.maxCount,
    );

    let tickValues: d3.AxisDomain[] = [];
    if (axesScaleType.xAxis === ScaleEnum.Log) {
      const { ticks, specifier } = getLogScaleAttributes(
        scale,
        ticksCount,
        tickConfig.precision.log,
      );
      tickValues = ticks;
      xAxis
        .ticks(ticksCount, specifier)
        .tickValues(tickValues)
        .tickFormat((d) => {
          return customFormatting(d, {
            ...tickConfig,
            precision: tickConfig.precision.log,
          });
        });
    } else {
      xAxis.ticks(ticksCount).tickFormat((d) => {
        return customFormatting(d, {
          ...tickConfig,
          precision: tickConfig.precision.linear,
        });
      });
      const domainData = scale.domain();
      if (domainData.length > ticksCount) {
        tickValues = domainData.filter(
          (v, i, arr) => i % Math.ceil(arr.length / ticksCount) === 0,
        );
        xAxis.tickValues(tickValues);
      }
    }

    return {
      xAxis,
      ticksCount,
      tickValues,
      tickConfig,
    };
  }

  function formatYAxisByDefault(
    scale: d3.AxisScale<d3.AxisDomain>,
    tickAdditionalConfig = {},
  ) {
    const tickConfig = {
      distance: 40,
      minCount: 3,
      maxCount: 20,
      precision: { log: 7, linear: 3 },
      maxLength: 9,
      omission: '..',
      defaultFormatMaxLength: 6,
      padding: 8,
      tickSizeInner: 0,
      ...tickAdditionalConfig,
    };

    const yAxis = d3
      .axisLeft(scale)
      .tickPadding(tickConfig.padding)
      .tickSizeInner(tickConfig.tickSizeInner);

    if (drawBgTickLines.y) {
      const tickSize = -width + (margin.left + margin.right);
      const tickSizeOuter = 0;
      yAxis.tickSize(tickSize).tickSizeOuter(tickSizeOuter);
    }

    const ticksCount = _.clamp(
      Math.floor(plotBoxRef.current.height / tickConfig.distance),
      tickConfig.minCount,
      tickConfig.maxCount,
    );

    if (axesScaleType.yAxis === ScaleEnum.Log) {
      const { ticks: tickValues, specifier } = getLogScaleAttributes(
        scale,
        ticksCount,
        tickConfig.precision.log,
      );
      yAxis
        .ticks(ticksCount, specifier)
        .tickValues(tickValues)
        .tickFormat((d) => {
          return customFormatting(d, {
            ...tickConfig,
            precision: tickConfig.precision.log,
          });
        });
    } else {
      yAxis.ticks(ticksCount).tickFormat((d) => {
        return customFormatting(d, {
          ...tickConfig,
          precision: tickConfig.precision.linear,
        });
      });
      const domainData = scale.domain();
      if (domainData.length > ticksCount) {
        const tickValues = domainData.filter(
          (v, i, arr) => i % Math.ceil(arr.length / ticksCount) === 0,
        );
        yAxis.tickValues(tickValues);
      }
    }

    return { yAxis };
  }

  function formatByStep(scale: d3.AxisScale<d3.AxisDomain>) {
    const { xAxis } = formatXAxisByDefault(scale);
    return {
      xAxis,
      xAxisTitle: _.capitalize(getKeyByAlignment(alignmentConfig)) + 's',
    };
  }

  function formatByEpoch(scale: d3.AxisScale<d3.AxisDomain>) {
    const { xAxis, ticksCount } = formatXAxisByDefault(scale, {
      minCount: 3,
    });

    const domain = scale.domain();
    const first = domain[0] as number;
    const last = domain[domain.length - 1] as number;
    const distance = Math.ceil((last - first) / (ticksCount - 1));
    const tickValues: number[] = [];
    for (let i = 0; i < ticksCount; i++) {
      const lastRounded = Math.floor(last);
      const current = Math.floor(first + i * distance);
      if (i === ticksCount - 1 && tickValues.indexOf(lastRounded) === -1) {
        tickValues.push(lastRounded);
      } else if (current < last) {
        tickValues.push(current);
      }
    }

    xAxis.tickValues(tickValues);

    return {
      xAxis,
      xAxisTitle: _.capitalize(getKeyByAlignment(alignmentConfig)) + 's',
    };
  }

  function formatByRelativeTime(scale: d3.AxisScale<d3.AxisDomain>) {
    let { xAxis, ticksCount, tickConfig, tickValues } = formatXAxisByDefault(
      scale,
      {
        distance: 120,
      },
    );

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
      tickValues = [];
      const distance = Math.ceil((last - first) / (ticksCount - 1));
      for (let i = 0; i < ticksCount; i++) {
        const lastRounded = Math.floor(last);
        let current = Math.floor(first + i * distance);
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
          _.truncate(
            shortEnglishHumanizer(Math.round(+d), humanizerConfigRef.current),
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

  function formatByAbsoluteTime(scale: d3.AxisScale<d3.AxisDomain>) {
    const { xAxis, ticksCount, tickConfig } = formatXAxisByDefault(scale, {
      minCount: 2,
      distance: 120,
      maxLength: 20,
    });

    const domain = scale.domain();
    const first = domain[0] as number;
    const last = domain[domain.length - 1] as number;
    const distance = Math.ceil((last - first) / (ticksCount - 1));
    const tickValues: number[] = [];
    for (let i = 0; i < ticksCount; i++) {
      const lastRounded = Math.floor(last);
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

  function formatByCustomMetric(scale: d3.AxisScale<d3.AxisDomain>) {
    const { xAxis } = formatXAxisByDefault(scale);
    return {
      xAxis,
      xAxisTitle: _.capitalize(getKeyByAlignment(alignmentConfig)),
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
    return formatter(scale);
  }

  function getFormattedYAxis(scale: d3.AxisScale<d3.AxisDomain>) {
    const { yAxis } = formatYAxisByDefault(scale);
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

    // TODO need to check necessity
    // if (
    //   axesScaleType.xAxis === ScaleEnum.Log &&
    //   alignmentConfig?.type === AlignmentOptionsEnum.ABSOLUTE_TIME
    // ) {
    //   ticks
    //     ?.select('text')
    //     .attr('transform', 'rotate(-12)')
    //     .attr('y', '12')
    //     .attr('x', '-20');
    // }

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
