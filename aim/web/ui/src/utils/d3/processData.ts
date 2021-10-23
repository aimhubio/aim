import _ from 'lodash-es';

import { IProcessData } from 'types/utils/d3/processData';
import { minMaxOfArray } from 'utils/minMaxOfArray';
import { removeOutliers } from 'utils/removeOutliers';
import { ILine } from 'types/components/LineChart/LineChart';

function processData(data: ILine[], ignoreOutliers: boolean): IProcessData {
  let xValues: number[] = [];
  let yValues: number[] = [];

  const processedData = data.map((line: ILine) => {
    const lineYValues: number[] = [];
    const lineXValues: number[] = [];
    /**
     * To draw the correct chart d3 needs to take sorted X-values
     *
     * Depends on X-values need to get corresponding Y-Values,
     * for that we need to keep indices before sorting
     * */
    line.data.xValues
      .map((value, i) => ({ i, value }))
      .sort((a, b) => a.value - b.value)
      .forEach((xObj, i) => {
        lineYValues[i] = line.data.yValues[xObj.i];
        lineXValues[i] = line.data.xValues[xObj.i];
      });

    xValues = xValues.concat(lineXValues);
    yValues = yValues.concat(lineYValues);

    return Object.assign(
      {
        color: '#000',
        dasharray: '0',
      },
      line,
      {
        data: {
          xValues: lineXValues,
          yValues: lineYValues,
        },
      },
    );
  });

  xValues = _.uniq(xValues);
  yValues = _.uniq(yValues);

  if (ignoreOutliers) {
    yValues = removeOutliers(yValues, 4);
  }

  let [yMin, yMax] = minMaxOfArray(yValues);
  // ADD margins for [yMin, yMax]
  if (yMax === yMin) {
    yMax += 1;
    yMin -= 1;
  } else {
    const diff = yMax - yMin;
    yMax += diff * 0.1;
    yMin -= diff * 0.05;
  }
  let [xMin, xMax] = minMaxOfArray(xValues);
  return {
    min: {
      x: xMin,
      y: yMin,
    },
    max: {
      x: xMax,
      y: yMax,
    },
    processedData,
    xValues,
    yValues,
  };
}

export default processData;
