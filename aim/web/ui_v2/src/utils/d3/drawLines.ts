import { CurveEnum } from './';
import { IDrawLinesProps } from 'types/utils/d3/drawLines';
import { toQuadrupleData, toTupleData } from 'utils/toFormatData';
import lineGenerator from './lineGenerator';
import { IProcessedData } from 'types/utils/d3/processData';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';
import areaGenerator from './areaGenerator';
import { IAggregatedData } from '../../types/services/models/metrics/metricsAppModel';
import { AggregationAreaMethods } from '../aggregateGroupData';
import { ILine } from 'types/components/LineChart/LineChart';

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
      .attr('class', 'Line')
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

  linesRef.current.updateAreasScales = function (
    xScale: IGetAxisScale,
    yScale: IGetAxisScale,
  ): void {
    linesNodeRef.current
      .selectAll('.Area')
      .transition()
      .duration(500)
      .attr('d', areaGenerator(xScale, yScale));
  };

  linesRef.current.updateAreas = function (data: IAggregatedData[]): void {
    linesNodeRef.current
      .selectAll('.Area')
      .data(data)
      .join('path')
      .attr('class', 'Area')
      .attr('id', (area: IAggregatedData) => `Area-${area.key}`)
      .attr('clip-path', 'url(#lines-rect-clip-' + index + ')')
      .attr('fill', (area: IAggregatedData) => area.color)
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

  if (
    aggregationConfig.isApplied &&
    aggregationConfig.methods.area !== AggregationAreaMethods.NONE
  ) {
    linesRef.current.updateAreas(props.aggregatedData);
  } else {
    linesRef.current.updateLines(props.data);
  }
}

export default drawLines;
