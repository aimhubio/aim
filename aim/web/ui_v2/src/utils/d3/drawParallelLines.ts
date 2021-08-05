import { cloneDeep } from 'lodash-es';

import lineGenerator from './lineGenerator';
import {
  IDrawParallelLinesProps,
  InitialPathDataType,
  ILinesDataType,
  IDrawParallelLineProps,
  ILineRendererProps,
  IGetColorIndicatorScaleValueProps,
} from 'types/utils/d3/drawParallelLines';
import { IGetAxisScale } from 'types/utils/d3/getAxisScale';

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
  data,
  linesRef,
  attributesNodeRef,
  isVisibleColorIndicator,
}: IDrawParallelLinesProps) {
  const keysOfDimensions: string[] = Object.keys(dimensions);
  linesRenderer({
    data,
    keysOfDimensions,
    curveInterpolation,
    linesNodeRef,
    attributesRef,
    isVisibleColorIndicator,
  });
  linesRef.current.updateLines = function (updatedData: ILinesDataType[]) {
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

function drawParallelLine({
  linesNodeRef,
  attributesRef,
  dimensionList,
  curveInterpolation,
  lineData,
  isDotted,
  color,
  key,
}: IDrawParallelLineProps) {
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
        true,
      ),
    )
    .attr('class', 'Line')
    .style('fill', 'none')
    .style('stroke', color)
    .style('stroke-opacity', isDotted ? '0.5' : '1')
    .style('stroke-dasharray', isDotted ? '4 1' : 0);
}

function linesRenderer({
  data,
  keysOfDimensions,
  curveInterpolation,
  linesNodeRef,
  attributesRef,
  isVisibleColorIndicator,
}: ILineRendererProps) {
  data.forEach(({ values: line, key, color }: ILinesDataType) => {
    if (Object.values(line).includes(null)) {
      const arrayOfPathData: InitialPathDataType[] = [
        cloneDeep(initialPathData),
      ];
      let pathDataArrayIndex: number = 0;
      for (let i = 0; i < keysOfDimensions.length; i++) {
        const keyOfDimension: string = keysOfDimensions[i];
        if (line[keyOfDimension] === null) {
          if (i === 0) continue;
          let nextStep: number = 1;
          while (line[keysOfDimensions[i + nextStep]] === null) {
            nextStep++;
          }
          if (nextStep + i < keysOfDimensions.length) {
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
            arrayOfPathData[pathDataArrayIndex + 2] =
              cloneDeep(initialPathData);
            pathDataArrayIndex = pathDataArrayIndex + 2;
          }
        } else {
          arrayOfPathData[pathDataArrayIndex].isEmpty = false;
          arrayOfPathData[pathDataArrayIndex].dimensionList.push(
            keyOfDimension,
          );
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
            key,
            color: isVisibleColorIndicator
              ? getColorIndicatorScaleValue(
                  line,
                  keysOfDimensions,
                  attributesRef,
                )
              : color,
          });
        }
      });
    } else {
      drawParallelLine({
        linesNodeRef,
        attributesRef,
        curveInterpolation,
        dimensionList: keysOfDimensions,
        lineData: line,
        isDotted: false,
        key,
        color: isVisibleColorIndicator
          ? getColorIndicatorScaleValue(line, keysOfDimensions, attributesRef)
          : color,
      });
    }
  });
}

function getColorIndicatorScaleValue({
  line,
  keysOfDimensions,
  yColorIndicatorScale,
  yScale,
}: IGetColorIndicatorScaleValueProps) {
  const lastKeyOfDimension: string =
    keysOfDimensions[keysOfDimensions.length - 1];
  const lastYScale: IGetAxisScale = yScale[lastKeyOfDimension];

  return yColorIndicatorScale(lastYScale(line[lastKeyOfDimension]) || 0);
}

export default drawParallelLines;
