import { IDrawLinesArgs } from 'types/utils/d3/drawLines';
import {
  IProcessedAggrData,
  IProcessedData,
} from 'types/utils/d3/processLineChartData';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

import { AggregationAreaMethods } from 'utils/aggregateGroupData';
import { CurveEnum, HighlightEnum } from 'utils/d3';

import lineGenerator from './lineGenerator';
import areaGenerator from './areaGenerator';

function drawLines(args: IDrawLinesArgs): void {
  const {
    index,
    nameKey,
    xScale,
    yScale,
    linesRef,
    linesNodeRef,
    curveInterpolation,
    highlightMode,
    aggregationConfig,
    processedData,
    processedAggrData,
  } = args;

  if (!linesNodeRef?.current) {
    return;
  }

  linesRef.current.updateScales = function (
    xScale: IAxisScale,
    yScale: IAxisScale,
    curve?: CurveEnum,
  ): void {
    linesNodeRef.current
      .selectAll('.Line')
      .attr('d', lineGenerator(xScale, yScale, curve));
  };

  linesRef.current.updateLines = function (data: IProcessedData[]): void {
    linesNodeRef.current
      ?.selectAll('.Line')
      .data(data)
      .join('path')
      .attr('class', `Line ${aggregationConfig?.isApplied ? 'aggregated' : ''}`)
      .attr('id', (d: IProcessedData) => `Line-${d.key}`)
      .attr('clip-path', `url(#${nameKey}-lines-rect-clip-${index})`)
      .attr('groupKey', (d: IProcessedData) => d.groupKey)
      .attr(
        'data-selector',
        (d: IProcessedData) =>
          `Line-Sel-${highlightMode}-${d.selectors?.[highlightMode]}`,
      )
      .style('fill', 'none')
      .style('stroke', (d: IProcessedData) => d.color)
      .style('stroke-dasharray', (d: IProcessedData) => d.dasharray)
      .data(data.map((d: IProcessedData) => d.data))
      .attr('d', lineGenerator(xScale, yScale, curveInterpolation));
  };

  linesRef.current.updateAggregatedAreasScales = function (
    xScale: IAxisScale,
    yScale: IAxisScale,
  ): void {
    linesNodeRef.current
      .selectAll('.AggrArea')
      .attr('d', areaGenerator(xScale, yScale));
  };

  linesRef.current.updateAggregatedAreas = function (
    data: IProcessedAggrData[],
  ): void {
    linesNodeRef.current
      .selectAll('.AggrArea')
      .data(data)
      .join('path')
      .attr('class', 'AggrArea')
      .attr('id', (d: IProcessedAggrData) => `AggrArea-${d.key}`)
      .attr('clip-path', `url(#${nameKey}-lines-rect-clip-${index})`)
      .attr('fill', (d: IProcessedAggrData) => d.color)
      .attr('fill-opacity', '0.3')
      .data(data.map((d: IProcessedAggrData) => d?.area || []))
      .attr('d', areaGenerator(xScale, yScale));
  };

  linesRef.current.updateAggregatedLinesScales = function (
    xScale: IAxisScale,
    yScale: IAxisScale,
    curve?: CurveEnum,
  ): void {
    linesNodeRef.current
      .selectAll('.AggrLine')
      .attr('d', lineGenerator(xScale, yScale, curve));
  };

  linesRef.current.updateAggregatedLines = function (
    data: IProcessedAggrData[],
  ): void {
    linesNodeRef.current
      .selectAll('.AggrLine')
      .data(data)
      .join('path')
      .attr('class', 'AggrLine')
      .attr('id', (d: IProcessedAggrData) => `AggrLine-${d.key}`)
      .attr('clip-path', `url(#${nameKey}-lines-rect-clip-${index})`)
      .style('fill', 'none')
      .style('stroke', (d: IProcessedAggrData) => d.color)
      .style('stroke-dasharray', (d: IProcessedAggrData) => d.dasharray)
      .data(data.map((d: IProcessedAggrData) => d.line || []))
      .attr('d', lineGenerator(xScale, yScale, curveInterpolation));
  };

  if (aggregationConfig?.isApplied) {
    if (aggregationConfig.methods.area !== AggregationAreaMethods.NONE) {
      linesRef.current.updateAggregatedAreas(processedAggrData);
    }
    linesRef.current.updateAggregatedLines(processedAggrData);
    if (highlightMode !== HighlightEnum.Off) {
      linesRef.current.updateLines(processedData);
    }
  } else {
    linesRef.current.updateLines(processedData);
  }
}

export default drawLines;
