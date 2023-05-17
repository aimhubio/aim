import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash-es';

import { IAxisScale } from 'types/utils/d3/getAxisScale';

import { ScaleEnum } from './index';

export function getLogScaleAttributes(
  scale: d3.AxisScale<d3.AxisDomain>,
  ticksCount: number = 10,
  precision: number = 2,
) {
  const domain = scale.domain() as number[];
  const logScale = d3.scaleLog().domain(domain);
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

export function customFormatting(
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
    const specifier = '.' + tickConfig.precision + '~g';
    tick = d3.format(specifier)(value);
  }
  return _.truncate(tick, {
    length: tickConfig.maxLength,
    omission: tickConfig.omission,
  });
}

export interface IFormatAxis {
  scale: d3.AxisScale<d3.AxisDomain>;
  tickAdditionalConfig?: {};
  drawTickLines: { x?: boolean; y?: boolean; tickSize: number };
  plotBoxRef: React.MutableRefObject<any>;
  scaleType: IAxisScale;
}

export function formatXAxisByDefault({
  scale,
  tickAdditionalConfig = {},
  drawTickLines = { x: false, y: false, tickSize: 0 },
  plotBoxRef,
  scaleType,
}: IFormatAxis) {
  const tickConfig = {
    distance: 90,
    minCount: 2,
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

  if (drawTickLines.x) {
    const tickSizeOuter = 0;
    xAxis.tickSize(drawTickLines.tickSize).tickSizeOuter(tickSizeOuter);
  }

  let ticksCount = _.clamp(
    Math.floor(plotBoxRef.current.width / tickConfig.distance),
    tickConfig.minCount,
    tickConfig.maxCount,
  );

  let tickValues: d3.AxisDomain[] = [];
  if (scaleType.xAxis === ScaleEnum.Log) {
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

export function formatYAxisByDefault({
  scale,
  tickAdditionalConfig = {},
  drawTickLines = { x: false, y: false, tickSize: 0 },
  plotBoxRef,
  scaleType,
}: IFormatAxis) {
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

  if (drawTickLines.y) {
    const tickSizeOuter = 0;
    yAxis.tickSize(drawTickLines.tickSize).tickSizeOuter(tickSizeOuter);
  }

  const ticksCount = _.clamp(
    Math.floor(plotBoxRef.current.height / tickConfig.distance),
    tickConfig.minCount,
    tickConfig.maxCount,
  );

  if (scaleType.yAxis === ScaleEnum.Log) {
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
