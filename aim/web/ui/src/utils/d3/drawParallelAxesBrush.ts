import * as d3 from 'd3';
import { isNil } from 'lodash-es';

import { ILineDataType } from 'types/utils/d3/drawParallelLines';
import {
  IDrawParallelAxesBrushBrushArgs,
  IFilterDataByBrushedScaleProps,
  DomainsDataType,
} from 'types/utils/d3/drawParallelAxesBrush';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

function drawParallelAxesBrush({
  brushRef,
  plotBoxRef,
  plotNodeRef,
  dimensions,
  data,
  linesRef,
  attributesRef,
}: IDrawParallelAxesBrushBrushArgs): void {
  brushRef.current.xScale = attributesRef.current.xScale;
  brushRef.current.yScale = { ...attributesRef.current.yScale };
  brushRef.current.domainsData = Object.keys(dimensions).reduce(
    (acc: DomainsDataType, keyOfDimension: string) => {
      acc[keyOfDimension] = dimensions[keyOfDimension].domainData;
      return acc;
    },
    {},
  );

  function handleBrushChange(
    event: d3.D3BrushEvent<d3.BrushSelection>,
    keyOfDimension: string,
  ): void {
    const extent: d3.BrushSelection | any = event.selection;
    if (!isNil(extent)) {
      if (dimensions[keyOfDimension].scaleType === 'point') {
        const domainData = scalePointDomainData(
          brushRef.current.yScale[keyOfDimension],
          extent,
        );
        brushRef.current.domainsData[keyOfDimension] = domainData;
      } else {
        const top: number | string = brushRef.current.yScale[
          keyOfDimension
        ].invert(extent[0]);
        const bottom: number | string = brushRef.current.yScale[
          keyOfDimension
        ].invert(extent[1]);
        brushRef.current.domainsData[keyOfDimension] = [bottom, top];
      }
    } else {
      brushRef.current.domainsData[keyOfDimension] =
        dimensions[keyOfDimension].domainData;
    }
    updateLinesAndHoverAttributes(brushRef, keyOfDimension, extent);
  }

  function updateLinesAndHoverAttributes(
    brushRef: React.MutableRefObject<any>,
    keyOfDimension: string,
    extent: d3.BrushSelection | any,
  ) {
    const filteredData = data.filter((line: ILineDataType) =>
      filterDataByBrushedScale({
        line,
        domainsData: brushRef.current.domainsData,
        dimensions,
      }),
    );
    linesRef.current.updateLines(filteredData);
    linesRef.current.data = filteredData;
    attributesRef.current.updateFocusedChart({
      mouse: [brushRef.current.xScale(keyOfDimension), extent ? extent[0] : 1],
      force: true,
    });
  }

  function handleBrushStart(event: d3.D3BrushEvent<d3.BrushSelection>): void {
    event?.sourceEvent?.stopPropagation();
  }

  const brushHeight = plotBoxRef.current.height;
  plotNodeRef.current
    .selectAll('.Axis')
    .append('g')
    .each(function (this: any, keyOfDimension: string) {
      d3.select(this).call(
        d3
          .brushY()
          .extent([
            [-15, 0],
            [15, brushHeight],
          ])
          .on('start', handleBrushStart)
          .on('brush', (event) => handleBrushChange(event, keyOfDimension))
          .on('end', (event) => handleBrushChange(event, keyOfDimension)),
      );
    })
    .selectAll('rect')
    .attr('x', -10)
    .attr('width', 20);
}

function scalePointDomainData(yScale: IAxisScale, extent: number[]): string[] {
  const domain: string[] = yScale.domain();
  const resultDomainData: string[] = [];
  domain.forEach((item: string) => {
    const yPosOfDomain = yScale(item);
    if (yPosOfDomain >= extent[0] && yPosOfDomain <= extent[1]) {
      resultDomainData.push(item);
    }
  });

  return resultDomainData;
}

function filterDataByBrushedScale({
  line,
  domainsData,
  dimensions,
}: IFilterDataByBrushedScaleProps) {
  const keysOfDimension: string[] = Object.keys(dimensions);
  const { values } = line;
  for (let i = 0; i < keysOfDimension.length; i++) {
    const keyOfDimension = keysOfDimension[i];
    const value: string | number | null = values[keyOfDimension];
    const domainData: Array<string | number> = domainsData[keyOfDimension];
    const { scaleType } = dimensions[keyOfDimension];
    if (
      value !== null &&
      ((scaleType === 'point' && !domainData.includes(value)) ||
        (scaleType !== 'point' &&
          (domainData[0] > value || domainData[1] < value)))
    ) {
      return false;
    }
  }

  return true;
}

export default drawParallelAxesBrush;
