import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import { IDrawLinesArgs } from 'types/utils/d3/drawLines';
import { IProcessedData } from 'types/utils/d3/processLineChartData';
import { IAxisScale } from 'types/utils/d3/getAxisScale';
import { IAggregatedData } from 'types/services/models/metrics/metricsAppModel';
import { ILine } from 'types/components/LineChart/LineChart';

import { AggregationAreaMethods } from 'utils/aggregateGroupData';
import { toQuadrupleData, toTupleData } from 'utils/toFormatData';

import lineGenerator from './lineGenerator';
import areaGenerator from './areaGenerator';

import { CurveEnum } from './';

function drawLines(args: IDrawLinesArgs): void {
  const {
    index,
    xScale,
    yScale,
    linesRef,
    linesNodeRef,
    curveInterpolation,
    highlightMode,
    aggregationConfig,
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
      .attr('id', (line: ILine) => `Line-${line.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .attr('groupKey', (line: ILine) => line.groupKey)
      .attr(
        'data-selector',
        (line: ILine) =>
          `Line-Sel-${highlightMode}-${line.selectors?.[highlightMode]}`,
      )
      .style('fill', 'none')
      .style('stroke', (line: ILine) => line.color)
      .style('stroke-dasharray', (line: ILine) => line.dasharray)
      .data(
        data.map((line: IProcessedData) =>
          toTupleData(line.data.xValues, line.data.yValues),
        ),
      )
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
    data: IAggregatedData[],
  ): void {
    linesNodeRef.current
      .selectAll('.AggrArea')
      .data(data)
      .join('path')
      .attr('class', 'AggrArea')
      .attr('id', (aggrData: IAggregatedData) => `AggrArea-${aggrData.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .attr('fill', (aggrData: IAggregatedData) => aggrData.color)
      .attr('fill-opacity', '0.3')
      .data(
        data.map((aggrData: IAggregatedData) =>
          toQuadrupleData(
            aggrData.area.max?.xValues || [],
            aggrData.area.min?.xValues || [],
            aggrData.area.max?.yValues || [],
            aggrData.area.min?.yValues || [],
          ),
        ),
      )
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
    data: IAggregatedData[],
  ): void {
    linesNodeRef.current
      .selectAll('.AggrLine')
      .data(data)
      .join('path')
      .attr('class', 'AggrLine')
      .attr('id', (aggrData: IAggregatedData) => `AggrLine-${aggrData.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .style('fill', 'none')
      .style('stroke', (aggrData: IAggregatedData) => aggrData.color)
      .style(
        'stroke-dasharray',
        (aggrData: IAggregatedData) => aggrData.dasharray,
      )
      .data(
        data.map((aggrData: IAggregatedData) =>
          toTupleData(
            aggrData.line?.xValues || [],
            aggrData.line?.yValues || [],
          ),
        ),
      )
      .attr('d', lineGenerator(xScale, yScale, curveInterpolation));
  };

  if (aggregationConfig?.isApplied) {
    if (aggregationConfig.methods.area !== AggregationAreaMethods.NONE) {
      linesRef.current.updateAggregatedAreas(args.aggregatedData);
    }
    linesRef.current.updateAggregatedLines(args.aggregatedData);
    if (highlightMode !== HighlightEnum.Off) {
      linesRef.current.updateLines(args.data);
    }
  } else {
    linesRef.current.updateLines(args.data);
  }
}

export default drawLines;
