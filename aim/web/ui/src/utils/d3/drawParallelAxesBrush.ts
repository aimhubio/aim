import * as d3 from 'd3';
import _ from 'lodash-es';

import { ILineDataType } from 'types/utils/d3/drawParallelLines';
import {
  IDrawParallelAxesBrushBrushArgs,
  IFilterDataByBrushedScaleProps,
  DomainsDataType,
} from 'types/utils/d3/drawParallelAxesBrush';
import { IAxisScale } from 'types/utils/d3/getAxisScale';
import { ISyncHoverStateArgs } from 'types/utils/d3/drawHoverAttributes';

function drawParallelAxesBrush({
  brushRef,
  plotBoxRef,
  plotNodeRef,
  dimensions,
  data,
  visBoxRef,
  linesRef,
  brushExtents,
  onAxisBrushExtentChange,
  attributesRef,
  index,
  syncHoverState,
}: IDrawParallelAxesBrushBrushArgs): void {
  if (!brushRef.current.domainsData) {
    brushRef.current.xScale = attributesRef.current.xScale;
    brushRef.current.yScale = { ...attributesRef.current.yScale };
    brushRef.current.domainsData = Object.keys(dimensions).reduce(
      (acc: DomainsDataType, keyOfDimension: string) => {
        acc[keyOfDimension] = dimensions[keyOfDimension].domainData;
        return acc;
      },
      {},
    );
  }

  function handleBrushChange(
    event: d3.D3BrushEvent<d3.BrushSelection>,
    keyOfDimension: string,
    removeFocusedCircle?: boolean,
  ): void {
    const extent: d3.BrushSelection | any = event.selection;
    let brushPosition: [number, number] | [string, string] | null = null;
    if (!_.isNil(extent)) {
      if (dimensions[keyOfDimension].scaleType === 'point') {
        const domainData = scalePointDomainData(
          brushRef.current.yScale[keyOfDimension],
          extent,
        );
        brushRef.current.domainsData[keyOfDimension] = domainData;
        brushPosition = [domainData[0], _.last(domainData)] as [string, string];
      } else {
        const top: number = brushRef.current.yScale[keyOfDimension].invert(
          extent[0],
        );
        const bottom: number = brushRef.current.yScale[keyOfDimension].invert(
          extent[1],
        );
        brushRef.current.domainsData[keyOfDimension] = [bottom, top];
        brushPosition = [bottom, top];
      }
    } else {
      brushRef.current.domainsData[keyOfDimension] =
        dimensions[keyOfDimension].domainData;
    }
    if (event.type === 'end') {
      onAxisBrushExtentChange(keyOfDimension, brushPosition, index);
    }
    if (removeFocusedCircle) {
      const tmpData = data[0];
      safeSyncHoverState({
        activePoint: {
          key: tmpData.key,
          xValue: attributesRef.current.focusedState.xValue,
          yValue: attributesRef.current.focusedState.yValue,
          xPos: 0,
          yPos: 0,
          chartIndex: index,
          pointRect: null,
        },
      });
    }
    updateLinesAndHoverAttributes(brushRef, keyOfDimension, extent);
  }

  function safeSyncHoverState(args: ISyncHoverStateArgs): void {
    if (typeof syncHoverState === 'function') {
      syncHoverState(args);
    }
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

    if (!_.isNil(attributesRef.current.focusedState?.yValue)) {
      attributesRef.current.updateFocusedChart({
        mouse: [
          brushRef.current.xScale(keyOfDimension),
          brushRef.current.yScale[keyOfDimension](
            attributesRef.current.focusedState?.yValue,
          ) + visBoxRef.current.margin.top,
        ],
        force: true,
      });
    }
  }

  function handleBrushStart(event: d3.D3BrushEvent<d3.BrushSelection>): void {
    event?.sourceEvent?.stopPropagation();
  }
  const brushHeight = plotBoxRef.current.height;
  plotNodeRef.current
    .selectAll('.Axis')
    .append('g')
    .attr('class', 'axisBrush')
    .each(function (this: any, keyOfDimension: string) {
      const brushExtent = brushExtents?.[index]?.[keyOfDimension];
      d3.select(this).call(
        d3
          .brushY()
          .extent([
            [-15, 0],
            [15, brushHeight],
          ])
          .handleSize(4)
          .on('start', handleBrushStart)
          .on('brush', (event) =>
            handleBrushChange(event, keyOfDimension, true),
          )
          .on('end', (event) => handleBrushChange(event, keyOfDimension, true)),
      );
      if (brushExtent) {
        const yScale = brushRef.current.yScale[keyOfDimension];
        const extent = [yScale(brushExtent[1]), yScale(brushExtent[0])];
        if (!_.isNil(extent[0]) && !_.isNil(extent[1])) {
          d3.select(this).call(d3.brush().handleSize(4).move, [
            [-15, extent[0]],
            [15, extent[1]],
          ]);
          handleBrushChange(
            {
              selection: extent,
            } as any,
            keyOfDimension,
          );
        } else {
          onAxisBrushExtentChange(keyOfDimension, null, index);
        }
      }
    });
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
      ((scaleType === 'point' && !domainData?.includes(value)) ||
        (scaleType !== 'point' &&
          (domainData[0] > value || domainData[1] < value)))
    ) {
      return false;
    }
  }

  return true;
}

export default drawParallelAxesBrush;
