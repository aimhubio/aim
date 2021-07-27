import { cloneDeep } from 'lodash-es';

import { CurveEnum } from './';
import lineGenerator from './lineGenerator';
import {
  IDrawParallelLinesProps,
  InitialPathDataType,
  LinesDataType,
  IDrawParallelLineProps,
} from 'types/utils/d3/drawParallelLines';

const initialPathData: InitialPathDataType = {
  dimensionList: [],
  lineData: {},
  isEmpty: true,
  isDotted: false,
};

function drawParallelLines(params: IDrawParallelLinesProps) {
  const { linesNodeRef, attributesRef, dimensions, data } = params;
  const keysOfDimensions: string[] = Object.keys(dimensions);
  data.forEach(({ values: line, key, color }: LinesDataType) => {
    if (Object.values(line).includes(null)) {
      const arrayOfPathData = [cloneDeep(initialPathData)];
      let pathDataArrayIndex = 0;
      for (let i = 0; i < keysOfDimensions.length; i++) {
        const keyOfDimension = keysOfDimensions[i];
        if (line[keyOfDimension] === null) {
          if (i === 0) continue;
          let nextStep = 1;
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
    // .attr(
    //   'data-selector',
    //   `Line-Sel-${highlightMode}-${line.selectors[highlightMode]}`,
    // )
    .style('fill', 'none')
    .style('stroke', color)
    .style('stroke-opacity', isDotted ? '0.5' : '1')
    .style('stroke-dasharray', isDotted ? '4 1' : 0);
}

export default drawParallelLines;
