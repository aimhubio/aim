import { cloneDeep, isNil } from 'lodash-es';

import {
  IDrawParallelLinesArgs,
  InitialPathDataType,
  ILineDataType,
  ILineRendererArgs,
  IGetColorIndicatorScaleValueArgs,
  IDrawParallelLineArgs,
} from 'types/utils/d3/drawParallelLines';
import { IAxisScale } from 'types/utils/d3/getAxisScale';

import lineGenerator from './lineGenerator';

const initialPathData: InitialPathDataType = {
  dimensionList: [],
  lineData: {},
  isEmpty: true,
  isDotted: false,
};

function drawParallelLines({
  linesNodeRef,
  attributesRef,
  dimensions,
  curveInterpolation,
  linesRef,
  data,
  attributesNodeRef,
  isVisibleColorIndicator,
}: IDrawParallelLinesArgs) {
  if (!linesNodeRef?.current || !linesRef?.current || !attributesRef?.current) {
    return;
  }
  const keysOfDimensions: string[] = Object.keys(dimensions);
  linesRenderer({
    data,
    keysOfDimensions,
    curveInterpolation,
    linesNodeRef,
    attributesRef,
    isVisibleColorIndicator,
  });
  linesRef.current.updateLines = function (updatedData: ILineDataType[]) {
    linesNodeRef.current?.selectAll('*')?.remove();
    attributesNodeRef.current?.selectAll('*')?.remove();
    linesRenderer({
      data: updatedData,
      keysOfDimensions,
      curveInterpolation,
      linesNodeRef,
      attributesRef,
      isVisibleColorIndicator,
    });
  };
}

function linesRenderer({
  data,
  keysOfDimensions,
  curveInterpolation,
  linesNodeRef,
  attributesRef,
  isVisibleColorIndicator,
}: ILineRendererArgs) {
  data.forEach(({ values: line, key, color, dasharray }: ILineDataType) => {
    const arrayOfPathData: InitialPathDataType[] = [cloneDeep(initialPathData)];
    let pathDataArrayIndex: number = 0;
    for (let i = 0; i < keysOfDimensions.length; i++) {
      const keyOfDimension: string = keysOfDimensions[i];
      if (isNil(line[keyOfDimension])) {
        if (i === 0) continue;
        let nextStep: number = 1;
        while (
          keysOfDimensions[i + nextStep] &&
          isNil(line[keysOfDimensions[i + nextStep]])
        ) {
          nextStep++;
        }
        if (
          nextStep + i < keysOfDimensions.length &&
          line[keysOfDimensions[i - 1]] &&
          line[keysOfDimensions[i + nextStep]]
        ) {
          arrayOfPathData[pathDataArrayIndex + 1] = {
            dimensionList: [
              keysOfDimensions[i - 1],
              keysOfDimensions[i + nextStep],
            ],
            lineData: {
              [keysOfDimensions[i - 1]]: line[keysOfDimensions[i - 1]],
              [keysOfDimensions[i + nextStep]]:
                line[keysOfDimensions[i + nextStep]],
            },
            isEmpty: false,
            isDotted: true,
          };
          arrayOfPathData[pathDataArrayIndex + 2] = cloneDeep(initialPathData);
          pathDataArrayIndex = pathDataArrayIndex + 2;
        }
        i = i + nextStep - 1;
      } else {
        arrayOfPathData[pathDataArrayIndex].isEmpty = false;
        arrayOfPathData[pathDataArrayIndex].dimensionList.push(keyOfDimension);
        arrayOfPathData[pathDataArrayIndex].lineData[keyOfDimension] =
          line[keyOfDimension];
      }
    }

    arrayOfPathData.forEach((pathData) => {
      if (!pathData.isEmpty) {
        drawParallelLine({
          linesNodeRef,
          attributesRef,
          curveInterpolation,
          dimensionList: pathData.dimensionList,
          lineData: pathData.lineData,
          isDotted: pathData.isDotted,
          dasharray,
          key,
          color: isVisibleColorIndicator
            ? getColorIndicatorScaleValue({
                line,
                keysOfDimensions,
                yColorIndicatorScale:
                  attributesRef.current.yColorIndicatorScale,
                yScale: attributesRef.current.yScale,
              })
            : color,
        });
      }
    });
  });
}

function drawParallelLine({
  linesNodeRef,
  attributesRef,
  dimensionList,
  curveInterpolation,
  lineData,
  dasharray,
  isDotted,
  color,
  key,
}: IDrawParallelLineArgs) {
  if (!linesNodeRef.current) {
    return;
  }
  linesNodeRef.current
    .append('path')
    .lower()
    .data([
      dimensionList.map((dimension: number | string, i: number) => [
        dimension,
        lineData[dimensionList[i]],
      ]),
    ])
    .attr('id', `Line-${key}`)
    .attr('clip-path', `url(#lines-rect-clip-${0})`)
    .attr(
      'd',
      lineGenerator(
        attributesRef.current.xScale,
        attributesRef.current.yScale,
        curveInterpolation,
      ),
    )
    .attr('class', 'Line')
    .style('fill', 'none')
    .style('stroke', isDotted ? '#9c9292' : color)
    .style('stroke-opacity', 1)
    .style('stroke-dasharray', isDotted ? '4 1' : dasharray);
}

function getColorIndicatorScaleValue({
  line,
  keysOfDimensions,
  yColorIndicatorScale,
  yScale,
}: IGetColorIndicatorScaleValueArgs) {
  const lastKeyOfDimension: string =
    keysOfDimensions[keysOfDimensions.length - 1];
  const lastYScale: IAxisScale = yScale[lastKeyOfDimension];

  return yColorIndicatorScale(lastYScale(line[lastKeyOfDimension]) || 0);
}

export default drawParallelLines;
