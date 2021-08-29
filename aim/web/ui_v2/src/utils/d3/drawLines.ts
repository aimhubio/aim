import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';
import { toQuadrupleData, toTupleData } from 'utils/toFormatData';
import lineGenerator from './lineGenerator';
import { IProcessedData } from 'types/utils/d3/processData';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';
import areaGenerator from './areaGenerator';
import { IAggregatedData } from 'types/services/models/metrics/metricsAppModel';
import { AggregationAreaMethods } from 'utils/aggregateGroupData';
import { ILine } from 'types/components/LineChart/LineChart';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

function drawLines(props: IDrawLinesProps): void {
  const {
    index,
    xScale,
    yScale,
    linesRef,
    linesNodeRef,
    curveInterpolation,
    highlightMode,
    aggregationConfig,
  } = props;

  if (!linesNodeRef?.current) {
    return;
  }

  linesRef.current.updateLinesScales = function (
    xScale: IGetAxisScale,
    yScale: IGetAxisScale,
    curve?: CurveEnum,
  ): void {
    linesNodeRef.current
      .selectAll('.Line')
      .transition()
      .duration(500)
      .attr('d', lineGenerator(xScale, yScale, curve));
  };

  linesRef.current.updateLines = function (data: IProcessedData[]): void {
    linesNodeRef.current
      .selectAll('.Line')
      .data(data)
      .join('path')
      .attr('class', `Line ${aggregationConfig?.isApplied ? 'aggregated' : ''}`)
      .attr('id', (line: ILine) => `Line-${line.key}`)
      .attr('clip-path', `url(#lines-rect-clip-${index})`)
      .attr(
        'data-selector',
        (line: ILine) =>
          `Line-Sel-${highlightMode}-${line.selectors[highlightMode]}`,
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
    xScale: IGetAxisScale,
    yScale: IGetAxisScale,
  ): void {
    linesNodeRef.current
      .selectAll('.AggrArea')
      .transition()
      .duration(500)
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
    xScale: IGetAxisScale,
    yScale: IGetAxisScale,
    curve?: CurveEnum,
  ): void {
    linesNodeRef.current
      .selectAll('.AggrLine')
      .transition()
      .duration(500)
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
      linesRef.current.updateAggregatedAreas(props.aggregatedData);
    }
    linesRef.current.updateAggregatedLines(props.aggregatedData);
    if (highlightMode !== HighlightEnum.Off) {
      linesRef.current.updateLines(props.data);
    }
  } else {
    linesRef.current.updateLines(props.data);
  }
}

export default drawLines;
