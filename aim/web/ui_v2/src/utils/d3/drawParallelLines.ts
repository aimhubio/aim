import { cloneDeep } from 'lodash-es';

import { CurveEnum } from './';
import lineGenerator from './lineGenerator';
import {
  IDrawParallelLinesProps,
  InitialPathDataType,
  ILinesDataType,
  IDrawParallelLineProps,
  ILineRendererProps,
} from 'types/utils/d3/drawParallelLines';

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
  data,
  linesRef,
  attributesNodeRef,
}: IDrawParallelLinesProps) {
  const keysOfDimensions: string[] = Object.keys(dimensions);
  linesRenderer({ data, keysOfDimensions, linesNodeRef, attributesRef });
  linesRef.current.updateLines = function (updatedData: ILinesDataType[]) {
    linesNodeRef.current?.selectAll('*')?.remove();
    attributesNodeRef.current?.selectAll('*')?.remove();
    linesRenderer({
      data: updatedData,
      keysOfDimensions,
      linesNodeRef,
      attributesRef,
    });
  };
}

function drawParallelLine({
  linesNodeRef,
  attributesRef,
  dimensionList,
  lineData,
  isDotted,
  color,
  key,
}: IDrawParallelLineProps) {
  linesNodeRef.current
    .append('path')
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
        CurveEnum.Linear,
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
  linesNodeRef,
  attributesRef,
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
            dimensionList: pathData.dimensionList,
            lineData: pathData.lineData,
            isDotted: pathData.isDotted,
            key,
            color,
          });
        }
      });
    } else {
      drawParallelLine({
        linesNodeRef,
        attributesRef,
        dimensionList: keysOfDimensions,
        lineData: line,
        isDotted: false,
        key,
        color,
      });
    }
  });
}

export default drawParallelLines;
