import _ from 'lodash-es';

import { IProcessLineChartData } from 'types/utils/d3/processLineChartData';
import { ILine } from 'types/components/LineChart/LineChart';

import { minMaxOfArray } from 'utils/minMaxOfArray';
import { removeOutliers } from 'utils/removeOutliers';

function processLineChartData(
  data: ILine[],
  ignoreOutliers: boolean = false,
): IProcessLineChartData {
  let xValues: number[] = [];
  let yValues: number[] = [];
  let yMinData: number[][] = [];
  let yMaxData: number[][] = [];

  const processedData = data.map((line) => {
    xValues = xValues.concat(line.data.xValues);
    yValues = yValues.concat(line.data.yValues);
    if (ignoreOutliers) {
      line.data.yValues.forEach((val, idx) => {
        if (yMinData.length > idx) {
          yMinData[idx].push(val);
        } else {
          yMinData.push([val]);
        }
        if (yMaxData.length > idx) {
          yMaxData[idx].push(val);
        } else {
          yMaxData.push([val]);
        }
      });
    }

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

  let yMin;
  let yMax;

  if (ignoreOutliers) {
    let normalMinData = removeOutliers(
      yMinData.map((e) => Math.min(...e)),
      4,
    );
    let normalMaxData = removeOutliers(
      yMaxData.map((e) => Math.max(...e)),
      4,
    );
    yMin = Math.min(...normalMinData);
    yMax = Math.max(...normalMaxData);
  } else {
    let minMax = minMaxOfArray(yValues);
    yMin = minMax[0];
    yMax = minMax[1];
  }

  // ADD margins for [yMin, yMax]
  if (yMax === yMin) {
    yMax += 1;
    yMin -= 1;
  } else {
    const diff = yMax - yMin;
    yMax += diff * 0.1;
    yMin -= (diff * 0.05 >= yMin ? yMin : diff) * 0.05;
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

export default processLineChartData;
