import _ from 'lodash-es';

import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { IDrawLinesArgs } from 'types/utils/d3/drawLines';
import {
  IProcessedAggrData,
  IProcessedData,
} from 'types/utils/d3/processLineChartData';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

import { AggregationAreaMethods } from 'utils/aggregateGroupData';

import lineGenerator from './lineGenerator';
import areaGenerator from './areaGenerator';

import { CurveEnum } from './';

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
    readOnly = false,
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
      .attr('id', (line: IProcessedData) => `Line-${line.key}`)
      .attr('clip-path', `url(#${nameKey}-lines-rect-clip-${index})`)
      .attr('groupKey', (line: IProcessedData) => line.groupKey)
      .attr(
        'data-selector',
        (line: IProcessedData) =>
          `Line-Sel-${highlightMode}-${line.selectors?.[highlightMode]}`,
      )
      .style('fill', 'none')
      .style('stroke', (line: IProcessedData) => line.color)
      .style('stroke-dasharray', (line: IProcessedData) => line.dasharray)
      .data(data.map((line: IProcessedData) => line.data))
      .attr('d', lineGenerator(xScale, yScale, curveInterpolation));
    if (!readOnly) {
      data.forEach((line: IProcessedData) => {
        if (line.run.props.active) {
          linesNodeRef.current
            .append('circle')
            .attr('class', 'inProgressLineIndicator')
            .attr('id', `inProgressLineIndicator-${line.key}`)
            .attr('cx', xScale(line.data[line.data.length - 1][0]))
            .attr('cy', yScale(line.data[line.data.length - 1][1]))
            .attr('r', 3)
            .raise();
        }
      });
    }
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
      .attr('id', (aggrData: IProcessedAggrData) => `AggrArea-${aggrData.key}`)
      .attr('clip-path', `url(#${nameKey}-lines-rect-clip-${index})`)
      .attr('fill', (aggrData: IProcessedAggrData) => aggrData.color)
      .attr('fill-opacity', '0.3')
      .data(data.map((aggrData: IProcessedAggrData) => aggrData?.area || []))
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
      .attr('id', (aggrData: IProcessedAggrData) => `AggrLine-${aggrData.key}`)
      .attr('clip-path', `url(#${nameKey}-lines-rect-clip-${index})`)
      .style('fill', 'none')
      .style('stroke', (aggrData: IProcessedAggrData) => aggrData.color)
      .style(
        'stroke-dasharray',
        (aggrData: IProcessedAggrData) => aggrData.dasharray,
      )
      .data(data.map((aggrData: IProcessedAggrData) => aggrData.line || []))
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
