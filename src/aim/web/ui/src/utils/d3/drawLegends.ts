import * as d3 from 'd3';
import _ from 'lodash-es';

import {
  LegendsDataType,
  LegendColumnDataType,
} from 'components/VisualizationLegends';

import { GroupNameEnum } from 'config/grouping/GroupingPopovers';

import changeDasharraySize from '../changeDasharraySize';
import shortenRunPropLabel from '../shortenRunPropLabel';
import { GroupType } from '../../modules/core/pipeline';

interface DrawLegendsArgs {
  data?: LegendsDataType;
  containerNode: HTMLDivElement | null;
  readOnly?: boolean;
}
interface GroupLegendProp {
  title: string;
  label: {
    key: string;
    element: string;
    setAttr: (
      cell: LegendColumnDataType,
      element: d3.Selection<any, unknown, null, undefined>,
      cellIndex: number,
    ) => void;
  };
}

const config = {
  margin: { top: 8, right: 8, bottom: 8, left: 8 },
  groupsGap: 20,
  groupTitle: {
    marginTop: 10,
    fontSize: '12px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
  },
  cellTitle: {
    height: 20,
    fontWeight: 600,
    margin: 20,
    maxWidth: 100,
  },
  cell: {
    height: 20,
    fontSize: '11px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
  },
  columnGap: 15,
  label: {
    width: 25,
    fontFamily: 'Inconsolata, monospace',
  },
  defaultColor: '#484f56',
};

const getGroupLegendProps: Record<string, (title?: string) => GroupLegendProp> =
  {
    [GroupNameEnum.CHART]: (title = 'Charts') => ({
      title,
      label: {
        key: '#',
        element: 'text',
        setAttr: <T extends SVGTextElement>(
          cell: LegendColumnDataType,
          element: d3.Selection<T, unknown, null, undefined>,
          cellIndex: number,
        ) => {
          const y =
            config.cellTitle.height +
            config.cellTitle.margin +
            cellIndex * config.cell.height;

          element
            ?.attr('y', y)
            .attr('fill', '#484f56')
            .style('outline', '1px solid #dee6f3')
            .style('border-radius', '1px')
            .style('padding', '2px')
            .style('white-space', 'pre')
            .text(` ${(cell.chartIndex || 0) + 1} `)
            .style('font-family', config.label.fontFamily);
        },
      },
    }),
    [GroupType.COLOR]: (title = 'Colors') => ({
      title,
      label: {
        key: '',
        element: 'line',
        setAttr: <T extends SVGLineElement>(
          cell: LegendColumnDataType,
          element: d3.Selection<T, unknown, null, undefined>,
          cellIndex: number,
        ) => {
          const y =
            config.cellTitle.height +
            config.cellTitle.margin +
            cellIndex * config.cell.height;

          element
            ?.attr('stroke', cell.color || config.defaultColor)
            .attr('stroke-dasharray', 'none')
            .attr('stroke-width', 2)
            .attr('x1', 0)
            .attr('x2', config.label.width)
            .attr('y1', y - 4)
            .attr('y2', y - 4);
        },
      },
    }),
    [GroupType.STROKE]: (title = 'Stroke styles') => ({
      title,
      label: {
        key: '',
        element: 'line',
        setAttr: <T extends SVGLineElement>(
          cell: LegendColumnDataType,
          element: d3.Selection<T, unknown, null, undefined>,
          cellIndex: number,
        ) => {
          const y =
            config.cellTitle.height +
            config.cellTitle.margin +
            cellIndex * config.cell.height;

          element
            ?.attr('stroke', config.defaultColor)
            .attr(
              'stroke-dasharray',
              changeDasharraySize(cell.dasharray, 3 / 5),
            )
            .attr('stroke-width', 2)
            .attr('x1', 0)
            .attr('x2', config.label.width)
            .attr('y1', y - 4)
            .attr('y2', y - 4)
            .attr('font-family', config.cell.fontFamily);
        },
      },
    }),
    [GroupType.ROW]: (title = 'Rows') => ({
      title,
      label: {
        key: '#',
        element: 'text',
        setAttr: <T extends SVGTextElement>(
          cell: LegendColumnDataType,
          element: d3.Selection<T, unknown, null, undefined>,
          cellIndex: number,
        ) => {
          const y =
            config.cellTitle.height +
            config.cellTitle.margin +
            cellIndex * config.cell.height;

          element
            ?.attr('y', y)
            .attr('fill', '#484f56')
            .style('outline', '1px solid #dee6f3')
            .style('border-radius', '1px')
            .style('padding', '2px')
            .style('white-space', 'pre')
            .text(` ${(cell.order || 0) + 1} `)
            .style('font-family', config.label.fontFamily);
        },
      },
    }),
    [GroupType.COLUMN]: (title = 'Columns') => ({
      title,
      label: {
        key: '#',
        element: 'text',
        setAttr: <T extends SVGTextElement>(
          cell: LegendColumnDataType,
          element: d3.Selection<T, unknown, null, undefined>,
          cellIndex: number,
        ) => {
          const y =
            config.cellTitle.height +
            config.cellTitle.margin +
            cellIndex * config.cell.height;

          element
            ?.attr('y', y)
            .attr('fill', '#484f56')
            .style('outline', '1px solid #dee6f3')
            .style('border-radius', '1px')
            .style('padding', '2px')
            .style('white-space', 'pre')
            .text(` ${(cell.order || 0) + 1} `)
            .style('font-family', config.label.fontFamily);
        },
      },
    }),
    default: (title: string = '') => ({
      title,
      label: {
        key: '',
        element: 'text',
        setAttr: <T extends SVGTextElement>(
          cell: LegendColumnDataType,
          element: d3.Selection<T, unknown, null, undefined>,
          cellIndex: number,
        ) => {
          const y =
            config.cellTitle.height +
            config.cellTitle.margin +
            cellIndex * config.cell.height;

          element?.attr('y', y);
        },
      },
    }),
  };

function drawLegends({
  data = {},
  containerNode,
  readOnly,
}: DrawLegendsArgs): void {
  if (!containerNode || _.isEmpty(data)) {
    return;
  }
  const { svgWrapper, bgRect, groupsWrapper } = drawLegendArea(
    containerNode,
    readOnly,
  );
  const { margin, groupsGap } = config;
  let currentGroupHeight = 0;
  for (const [legendName, legend] of Object.entries(data)) {
    const groupElement = drawLegend(
      legendName,
      legend,
      groupsWrapper,
      currentGroupHeight,
    );
    if (groupElement) {
      currentGroupHeight += groupElement.node()?.getBBox().height || 0;
      currentGroupHeight += groupsGap;
    }
  }
  const { width: groupsWrapperWidth = 0, height: groupsWrapperHeight = 0 } =
    groupsWrapper.node()?.getBBox() || {};

  const svgWidth = margin.left + margin.right + groupsWrapperWidth;
  const svgHeight = margin.top + margin.bottom + groupsWrapperHeight;

  bgRect.attr('height', svgHeight).attr('width', svgWidth);
  svgWrapper.attr('height', svgHeight).attr('width', svgWidth);
}

function drawLegendArea(
  containerNode: HTMLDivElement | null,
  readOnly: boolean = false,
) {
  const container = d3.select(containerNode);
  container.select('*')?.remove();

  const { margin, defaultColor } = config;

  const svgWrapper = container
    .append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('class', 'Legends')
    .style('fill', 'transparent')
    .raise();

  const bgRect = svgWrapper
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('class', 'Legends-bgRect')
    .style('fill', 'transparent');

  if (readOnly) {
    bgRect.style('stroke-width', 1).style('stroke', '#bdcee8');
  }

  const groupsWrapper = svgWrapper
    .append('g')
    .attr('class', 'Legend-groups-wrapper')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .style('fill', defaultColor);

  return { svgWrapper, groupsWrapper, bgRect };
}

function drawLegend(
  legendName: string,
  legend: Record<string, LegendColumnDataType[]>,
  wrapperGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  currentGroupHeight: number,
) {
  if (_.isEmpty(legend)) {
    return;
  }

  const groupElement = wrapperGroup
    .append('g')
    .attr('id', `Legend-group-${legendName}`)
    .attr('transform', `translate(${0}, ${currentGroupHeight})`);

  const cb = getGroupLegendProps[legendName] || getGroupLegendProps.default;
  const groupLegendProp = cb();

  // group title
  groupElement
    .append('text')
    .text(groupLegendProp.title)
    .attr('font-size', config.groupTitle.fontSize)
    .attr('font-weight', config.groupTitle.fontWeight)
    .attr('font-family', config.groupTitle.fontFamily)
    .attr('y', config.groupTitle.marginTop)
    .style('text-transform', 'uppercase');

  drawLegendColumns(
    legendName,
    Object.entries(legend),
    groupElement,
    config.groupTitle.marginTop,
    groupLegendProp,
  );

  return groupElement;
}

function drawLegendColumns(
  legendName: string,
  columns: [string, LegendColumnDataType[]][] = [],
  wrapperGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  groupYPos: number,
  groupLegendProp: GroupLegendProp,
) {
  if (columns.length === 0) {
    return;
  }

  const labelColumnCells = columns[0][1];
  // column labels
  drawLegendColumn(
    legendName,
    groupLegendProp.label.key,
    labelColumnCells,
    wrapperGroup,
    { x: 0, y: groupYPos },
    groupLegendProp.label,
  );

  let currentColumnWidth = config.label.width + config.columnGap;

  for (let [columnKey, columnCells] of columns) {
    const columnWrapper = drawLegendColumn(
      legendName,
      columnKey,
      columnCells,
      wrapperGroup,
      {
        x: currentColumnWidth,
        y: groupYPos,
      },
    );

    if (columnWrapper) {
      currentColumnWidth += columnWrapper.node()?.getBBox().width || 0;
      currentColumnWidth += config.columnGap;
    }
  }
}

function drawLegendColumn(
  legendName: string,
  columnKey: string,
  columnCells: LegendColumnDataType[] = [],
  wrapperGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  groupPos: { x: number; y: number },
  label?: GroupLegendProp['label'],
) {
  if (columnCells.length === 0) {
    return;
  }

  const columnGroup = wrapperGroup
    .append('g')
    .attr('class', `Legend-${legendName}-column`)
    .attr('font-size', config.cell.fontSize)
    .attr('font-family', config.cell.fontFamily)
    .attr('font-weight', config.cell.fontWeight)
    .attr('transform', `translate(${groupPos.x}, ${groupPos.y})`);

  const { shortenValue } = shortenRunPropLabel(
    columnKey,
    config.cellTitle.maxWidth,
  );

  // column title
  columnGroup
    .append('text')
    .text(shortenValue)
    .attr('font-weight', config.cellTitle.fontWeight)
    .attr('x', 0)
    .attr('y', config.cellTitle.height)
    .append('svg:title')
    .text(columnKey);

  if (label) {
    // column label
    columnGroup
      .selectAll('.Legend-label')
      .data(columnCells)
      .join(label.element)
      .attr('class', 'Legend-label')
      .each((d, i, nodes) => label.setAttr(d, d3.select(nodes[i]), i));
  } else {
    // column cells
    columnGroup
      .selectAll('.Legend-cell')
      .data(columnCells)
      .join('text')
      .attr('class', 'Legend-cell')
      .text((cell) => cell.value)
      .attr('fill', (cell) => cell.color || config.defaultColor)
      .attr('x', 0)
      .attr(
        'y',
        (cell, cellIndex) =>
          config.cellTitle.height +
          config.cellTitle.margin +
          cellIndex * config.cell.height,
      );
  }

  return columnGroup;
}

export default drawLegends;
