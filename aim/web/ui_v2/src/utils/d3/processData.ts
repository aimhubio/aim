import _ from 'lodash-es';

import { IProcessData } from 'types/utils/d3/processData';
import { minMaxOfArray } from 'utils/minMaxOfArray';
import { removeOutliers } from 'utils/removeOutliers';
import { ILine } from 'types/components/LineChart/LineChart';

function processData(data: ILine[], displayOutliers: boolean): IProcessData {
  let xValues: number[] = [];
  let yValues: number[] = [];

  const processedData = data.map((line) => {
    xValues = xValues.concat(line.data.xValues);
    yValues = yValues.concat(line.data.yValues);

    return Object.assign(
      {
        color: '#000',
        dasharray: '0',
      },
      line,
      {
        data: {
          xValues: line.data.xValues,
          yValues: line.data.yValues,
        },
      },
    );
  });

  xValues = _.uniq(xValues);
  yValues = _.uniq(yValues);

  if (!displayOutliers) {
    yValues = removeOutliers(yValues, 4);
  }

  let [yMin, yMax] = minMaxOfArray(yValues);
  // ADD margins for [yMin, yMax] lines
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
  };
}

export default processData;
