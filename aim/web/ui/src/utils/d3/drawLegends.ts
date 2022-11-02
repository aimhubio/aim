import * as d3 from 'd3';

import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import {
  LegendRowDataType,
  LegendsDataType,
} from 'types/services/models/metrics/metricsAppModel';

import changeDasharraySize from '../changeDasharraySize';

interface DrawLegendsArgs {
  legendsData?: LegendsDataType;
  containerNode: HTMLDivElement | null;
}

const config = {
  margin: { top: 8, right: 8, bottom: 8, left: 8 },
  groupsGap: 30,
  groupTitleMargin: 20,
  rowsGap: 22,
  cellWidth: 140,
  labelWidth: 40,
  labelMargin: 20,
  color: '#484f56',
};

const legendProps: Record<string, any> = {
  [GroupNameEnum.COLOR]: {
    value: 'color',
    title: 'Colors',
    label: {
      element: 'line',
      setAttr: (
        row: LegendRowDataType,
        element: d3.Selection<SVGLineElement, unknown, null, undefined>,
      ) => {
        element
          ?.attr('stroke', row.color || config.color)
          .attr('stroke-dasharray', 'none')
          .attr('stroke-width', 2)
          .attr('x1', 0)
          .attr('x2', config.labelWidth - config.labelMargin)
          .attr('y1', -4)
          .attr('y2', -4);
      },
    },
  },
  [GroupNameEnum.STROKE]: {
    value: 'dasharray',
    title: 'Stroke styles',
    label: {
      element: 'line',
      setAttr: (
        row: LegendRowDataType,
        element: d3.Selection<SVGLineElement, unknown, null, undefined>,
      ) => {
        element
          ?.attr('stroke', config.color)
          .attr('stroke-dasharray', changeDasharraySize(row.dasharray, 3 / 5))
          .attr('stroke-width', 2)
          .attr('x1', 0)
          .attr('x2', config.labelWidth - config.labelMargin)
          .attr('y1', -4)
          .attr('y2', -4);
      },
    },
  },
  [GroupNameEnum.CHART]: {
    value: 'chartIndex',
    title: 'Charts',
    label: {
      element: 'text',
      setAttr: (
        row: LegendRowDataType,
        element: d3.Selection<SVGTextElement, unknown, null, undefined>,
      ) => {
        element?.text(`[${(row.chartIndex || 0) + 1}]`);
      },
    },
  },
};

function drawLegends({
  legendsData = {},
  containerNode,
}: DrawLegendsArgs): void {
  if (!containerNode) {
    return;
  }
  const container = d3.select(containerNode);
  container.selectAll('.Legends')?.remove();

  const svgWrapper = container
    .append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('class', 'Legends')
    .style('fill', 'transparent')
    .raise();

  const {
    margin,
    cellWidth,
    groupsGap,
    groupTitleMargin,
    rowsGap,
    labelWidth,
    color,
  } = config;

  const groupsWrapper = svgWrapper
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('font-size', '11px')
    .attr('font-weight', 400)
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill', color);

  let groupCurrentHeight = margin.top;

  Object.entries(legendsData).forEach(([groupName, legendData]) => {
    const groupProps = legendProps[groupName];
    const groupTitle = groupsWrapper
      .append('g')
      .attr('transform', `translate(${0}, ${groupCurrentHeight})`);

    groupTitle
      .append('text')
      .text(groupProps.title)
      .attr('font-size', '12px')
      .attr('font-weight', 600)
      .style('text-transform', 'uppercase');

    groupCurrentHeight += groupTitleMargin;

    const legendGroup = groupsWrapper
      .append('g')
      .attr('transform', `translate(${0}, ${groupCurrentHeight})`);

    const { keys, rows } = legendData;

    keys.forEach((key, keyIndex) => {
      legendGroup
        .append('text')
        .text(key)
        .attr('font-size', '11px')
        .attr('font-weight', 600)
        .attr('x', cellWidth * keyIndex);
    });

    rows.forEach((row) => {
      groupCurrentHeight += rowsGap;
      const rowGroup = groupsWrapper
        .append('g')
        .attr('transform', `translate(${0}, ${groupCurrentHeight})`);

      const labelElement = rowGroup.append(groupProps.label.element);
      groupProps.label.setAttr(row, labelElement);

      Object.entries(row.config).forEach(([key, value], cellIndex) => {
        rowGroup
          .append('text')
          .text(`${value}`)
          .attr('fill', row.color || color)
          .attr('x', labelWidth + cellWidth * cellIndex);
      });
    });
    groupCurrentHeight += groupsGap;
  });

  const { height: groupsWrapperHeight = 0, width: groupsWrapperWidth = 0 } =
    groupsWrapper?.node()?.getBBox() || {};

  svgWrapper
    .attr('height', margin.top + margin.bottom + groupsWrapperHeight)
    .attr('width', margin.left + margin.right + groupsWrapperWidth);
}

export default drawLegends;
