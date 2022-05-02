import _ from 'lodash-es';

import {
  ICalculateLineValues,
  IGetValueInLine,
  IProcessedAggrData,
  IProcessedData,
  IProcessLineChartData,
  IProcessLineChartDataArgs,
} from 'types/utils/d3/processLineChartData';
import { ILine } from 'types/components/LineChart/LineChart';

import { minMaxOfArray } from 'utils/minMaxOfArray';
import { removeOutliers } from 'utils/removeOutliers';

import { toQuadrupleData, toTupleData } from '../toFormatData';
import getRoundedValue from '../roundValue';

import { getAxisScale, ScaleEnum } from './index';

function processLineChartData({
  data,
  ignoreOutliers = false,
  visBoxRef,
  axesScaleType,
  aggregatedData,
  aggregationConfig,
}: IProcessLineChartDataArgs): IProcessLineChartData {
  let allXValues: number[] = [];
  let allYValues: number[] = [];
  let tupleLineChartData: IProcessedData[] = [];
  let quadrupleAggrData: IProcessedAggrData[] = [];
  let yBounds: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const line: ILine = data[i];
    const { xValues, yValues } = line.data;

    const tupleData = toTupleData(xValues, yValues);

    const xSyncedValues = [];
    const ySyncedValues = [];

    for (let d of tupleData) {
      xSyncedValues.push(d[0]);
      ySyncedValues.push(d[1]);
    }

    // supposed received x values are sorted by ascending order (y values are sorted by x)
    allXValues = allXValues.concat(xSyncedValues);
    allYValues = allYValues.concat(ySyncedValues);
    // find y bounds for lines to ignore "acceptable" outliers
    if (ignoreOutliers) {
      yBounds = yBounds.concat(minMaxOfArray(removeOutliers(yValues, 4)));
    }

    tupleLineChartData.push({
      color: '#000',
      dasharray: 'none',
      ...line,
      data: tupleData,
    });
  }

  if (aggregationConfig?.isApplied && aggregatedData) {
    for (let i = 0; i < aggregatedData.length; i++) {
      const aggrData = aggregatedData[i];
      quadrupleAggrData.push({
        ...aggrData,
        area: toQuadrupleData(
          aggrData.area.max?.xValues || [],
          aggrData.area.max?.yValues || [],
          aggrData.area.min?.xValues || [],
          aggrData.area.min?.yValues || [],
        ),
        line: toTupleData(
          aggrData.line?.xValues || [],
          aggrData.line?.yValues || [],
        ),
      });
    }
  }

  let [yMin = 0, yMax = 0] = minMaxOfArray(
    ignoreOutliers ? yBounds : _.uniq(allYValues),
  );
  let [xMin, xMax] = minMaxOfArray(_.uniq(allXValues));

  // ADD margin for y-dimension
  const diff = yMax - yMin;
  const portion = 0.05;
  const yMargin = yMax !== yMin ? diff * portion : 1;
  yMax += yMargin;
  yMin -=
    axesScaleType.yAxis === ScaleEnum.Log && yMin <= yMargin ? 0 : yMargin;

  const { width, height, margin } = visBoxRef.current;

  // create axes scale functions
  const xScale = getAxisScale({
    domainData: [xMin, xMax],
    rangeData: [0, width - margin.left - margin.right],
    scaleType: axesScaleType.xAxis,
  });
  const yScale = getAxisScale({
    domainData: [yMin, yMax],
    rangeData: [height - margin.top - margin.bottom, 0],
    scaleType: axesScaleType.yAxis,
  });

  let processedData = tupleLineChartData;
  let processedAggrData = quadrupleAggrData;

  if (ignoreOutliers) {
    const offsetScaled = 20;
    const minEdge = getRoundedValue(yScale.invert(yScale(yMin) + offsetScaled));
    const maxEdge = getRoundedValue(yScale.invert(yScale(yMax) - offsetScaled));

    processedData = tupleLineChartData.map((line) => ({
      ...line,
      data: calculateLineValues({
        values: line.data,
        xMin,
        xMax,
        minEdge,
        maxEdge,
        axesScaleType,
      }),
    }));

    processedAggrData = quadrupleAggrData.map((aggrData) => {
      let min: [number, number][] = [];
      let max: [number, number][] = [];

      aggrData.area.forEach(([x0, y0, x1, y1]) => {
        max.push([x0, y0]);
        min.push([x1, y1]);
      });

      const area = {
        min: calculateLineValues({
          values: min,
          xMin,
          xMax,
          minEdge,
          maxEdge,
          axesScaleType,
        }),
        max: calculateLineValues({
          values: max,
          xMin,
          xMax,
          minEdge,
          maxEdge,
          axesScaleType,
        }),
      };
      const line = calculateLineValues({
        values: aggrData.line,
        xMin,
        xMax,
        minEdge,
        maxEdge,
        axesScaleType,
      });

      // Calculated area's (min/max arrays) can have different length
      // need to fill them (to equal their length) to draw aggregated area's correctly
      const [longArea, shortArea] =
        area.max.length > area.min.length
          ? [area.max, area.min]
          : [area.min, area.max];

      let prev: number[];
      const filledAreaData = longArea
        .map(([x1, y1], i: number) => {
          let x, y;
          if (shortArea[i]) {
            let [x2, y2] = shortArea[i];
            x = x2;
            y = y2;
          } else {
            if (prev) {
              x = prev[0];
              y = getValueInLine({
                x1: x,
                x2: x1,
                y1: prev[1],
                y2: y1,
                x: x,
                axesScaleType,
              });
            } else {
              x = x1;
              let [nextX, nextY] = shortArea[i + 1] || [];
              y = getValueInLine({
                x1,
                x2: nextX,
                y1,
                y2: nextY,
                x: x1,
                axesScaleType,
              });
            }
          }
          prev = [x, y];
          return [x1, y1, x, y];
        })
        .sort((a, b) => a[0] - b[0]);

      return {
        ...aggrData,
        area: filledAreaData,
        line,
      } as IProcessedAggrData;
    });
  }

  return {
    min: { x: xMin, y: yMin },
    max: { x: xMax, y: yMax },
    processedData,
    processedAggrData,
    allXValues,
    allYValues,
    xScale,
    yScale,
  };
}

export default processLineChartData;

// get cropped lines for having an ability to draw large scale lines in browser
function calculateLineValues({
  values,
  xMin,
  xMax,
  minEdge,
  maxEdge,
  axesScaleType,
}: ICalculateLineValues) {
  let leftEdgeIndex = _.findLastIndex(values, (v: number[]) => v[0] <= xMin);
  let rightEdgeIndex = _.findIndex(values, (v: number[]) => v[0] >= xMax);
  if (leftEdgeIndex === -1) {
    leftEdgeIndex = 0;
  }
  if (rightEdgeIndex === -1) {
    rightEdgeIndex = values.length - 1;
  }
  const visibleValues = values.slice(leftEdgeIndex, rightEdgeIndex + 1);

  let prevValue: number[] = [];

  let result = visibleValues
    .map(([xValue, yValue]: number[], i: number) => {
      let x = xValue;
      let y = _.clamp(yValue, minEdge, maxEdge);
      let value: number[][] | number[] = [x, y];
      if (y === yValue) {
        prevValue = [x, y];
      } else {
        let [nextX, nextYValue] = visibleValues[i + 1] || [];
        const nextY = _.clamp(nextYValue, minEdge, maxEdge);
        if (i === 0) {
          if (visibleValues.length > 1) {
            let x2 = getValueInLine({
              x1: x,
              x2: nextX,
              y1: yValue,
              y2: nextY,
              y: y,
              axesScaleType,
            });
            value = [
              [x, y],
              [x2, y],
            ];
            prevValue = [x2, y];
          } else {
            prevValue = [x, y];
            value = [x, y];
          }
        } else {
          x = getValueInLine({
            x1: prevValue[0],
            x2: xValue,
            y1: prevValue[1],
            y2: yValue,
            y: y,
            axesScaleType,
          });
          if (i !== visibleValues.length - 1) {
            let x2 = getValueInLine({
              x1: xValue,
              x2: nextX,
              y1: yValue,
              y2: nextY,
              y: y,
              axesScaleType,
            });
            value = [
              [x, y],
              [x2, y],
            ];
            prevValue = [x2, y];
          } else {
            value = [x, y];
          }
        }
      }

      return (Array.isArray(value[0]) ? value : [value]) as [number, number][];
    })
    .flat()
    .sort((a, b) => a[0] - b[0]);

  let minIndex = -1;
  let maxIndex = result.length;

  for (let i = 0; i < result.length; i++) {
    const [x] = result[i];
    if (x < xMin && i > minIndex) {
      minIndex = i;
    }
    if (x > xMax && i < maxIndex) {
      maxIndex = i;
    }
  }

  if (minIndex >= maxIndex) {
    result = [];
  } else {
    if (minIndex > -1 && minIndex < result.length - 1) {
      result[minIndex] = [
        xMin,
        getValueInLine({
          x1: result[minIndex][0],
          x2: result[minIndex + 1][0],
          y1: result[minIndex][1],
          y2: result[minIndex + 1][1],
          x: xMin,
          axesScaleType,
        }),
      ];
    }
    if (maxIndex < result.length && maxIndex > 0) {
      result[maxIndex] = [
        xMax,
        getValueInLine({
          x1: result[maxIndex - 1][0],
          x2: result[maxIndex][0],
          y1: result[maxIndex - 1][1],
          y2: result[maxIndex][1],
          x: xMax,
          axesScaleType,
        }),
      ];
    }
  }

  return result.slice(minIndex > -1 ? minIndex : 0, maxIndex + 1);
}

// get [x or y] value in line depending on [x1,y1] and [x2, y2] and [y or x]
function getValueInLine({
  x1,
  x2,
  y1,
  y2,
  x,
  y,
  axesScaleType,
}: IGetValueInLine): number {
  let value = 0;
  if (x === undefined && y) {
    let dx1;
    let dx2;
    let dy1;
    let dy2;
    if (x1 === x2) {
      value = x1;
    } else {
      if (axesScaleType.xAxis === ScaleEnum.Linear) {
        dx1 = x1;
        dx2 = x2;
      } else {
        dx1 = Math.log(x1);
        dx2 = Math.log(x2);
      }
      if (axesScaleType.yAxis === ScaleEnum.Linear) {
        dy1 = y - y1;
        dy2 = y2 - y1;
      } else {
        dy1 = Math.log(y) - Math.log(y1);
        dy2 = Math.log(y2) - Math.log(y1);
      }
      if (dx1 > dx2) {
        value = dx1 - ((dx1 - dx2) * dy1) / dy2;
      } else {
        value = ((dx2 - dx1) * dy1) / dy2 + dx1;
      }
      if (axesScaleType.xAxis === ScaleEnum.Log) {
        value = Math.exp(value);
      }
    }
  } else if (y === undefined && x) {
    let dx1;
    let dx2;
    let dy1;
    let dy2;
    if (x1 === x2 || x === x1) {
      value = y1;
    } else if (x === x2) {
      value = y2;
    } else {
      if (axesScaleType.xAxis === ScaleEnum.Linear) {
        dx1 = x - x1;
        dx2 = x2 - x1;
      } else {
        dx1 = Math.log(x) - Math.log(x1);
        dx2 = Math.log(x2) - Math.log(x1);
      }
      if (axesScaleType.yAxis === ScaleEnum.Linear) {
        dy1 = y1;
        dy2 = y2;
      } else {
        dy1 = Math.log(y1);
        dy2 = Math.log(y2);
      }
      if (dy1 > dy2) {
        value = dy1 - ((dy1 - dy2) * dx1) / dx2;
      } else {
        value = ((dy2 - dy1) * dx1) / dx2 + dy1;
      }
      if (axesScaleType.yAxis === ScaleEnum.Log) {
        value = Math.exp(value);
      }
    }
  }
  return getRoundedValue(value);
}
