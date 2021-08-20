import _ from 'lodash-es';
import {
  IAggregationData,
  IMetricsCollection,
} from 'types/services/models/metrics/metricsAppModel';

import { IAggregateGroupDataParams } from 'types/utils/aggregateGroupData';
import { ScaleEnum } from './d3';
import { IMetric } from 'types/services/models/metrics/metricModel';

export enum AggregationAreaMethods {
  NONE,
  MIN_MAX,
  STD_DEV,
  STD_ERR,
  CONF_INT,
}

export enum AggregationLineMethods {
  MEAN,
  MEDIAN,
  MIN,
  MAX,
}

export function aggregateGroupData({
  groupData,
  methods,
  scale = { xAxis: ScaleEnum.Linear, yAxis: ScaleEnum.Linear },
}: IAggregateGroupDataParams): IMetricsCollection<IMetric>[] {
  const groupsWithAggregation = [];

  const groupedByChart = _.groupBy(groupData, 'chartIndex');

  const xValuesPerChart: { [key: string]: number[] } = {};

  // Get all X axis values for each chart
  for (let chartIndex in groupedByChart) {
    const groupsData = _.map(groupedByChart[chartIndex], (group) => group.data);
    xValuesPerChart[chartIndex] = _.uniq(
      groupsData
        .flat()
        .map((item) => item.data.xValues)
        .flat(),
    );
  }

  for (let group of groupData) {
    const chartIndex = group.chartIndex;
    const chartXValues = xValuesPerChart[chartIndex];
    const yValuesPerX: { [key: string]: number[] } = {};
    const data = group.data;

    for (let i = 0; i < data.length; i++) {
      const trace = data[i].data;

      // Calculate line value (y) for each X axis value in chart
      // Even for case when line does not have corresponding x value
      for (let j = 0; j < trace.xValues.length; j++) {
        const step = trace.xValues[j];
        const point = trace.yValues[j];
        const nextStep = trace.xValues[j + 1];
        const nextPoint = trace.yValues[j + 1];

        const stepsInBetween = nextStep - step;

        for (let value of chartXValues.slice(
          chartXValues.indexOf(step),
          chartXValues.indexOf(nextStep) + 1,
        )) {
          let y;
          let x0 = value - step;
          let x2 = stepsInBetween;
          let point1 = point;
          let point2 = nextPoint;

          if (x0 === 0) {
            y = point1;
          } else if (x0 === x2) {
            y = point2;
          } else {
            if (scale.xAxis === ScaleEnum.Log) {
              x0 = Math.log(value) - Math.log(step);
              x2 = Math.log(nextStep) - Math.log(step);
            }
            if (scale.yAxis === ScaleEnum.Log) {
              point1 = Math.log(point1);
              point2 = Math.log(point2);
            }
            if (point1 > point2) {
              y = point1 - ((point1 - point2) * x0) / x2;
            } else {
              y = ((point2 - point1) * x0) / x2 + point1;
            }
            if (scale.yAxis === ScaleEnum.Log) {
              y = Math.exp(y);
            }
          }
          if (
            (scale.xAxis === ScaleEnum.Linear ||
              (value !== 0 && step !== 0 && nextStep !== 0)) &&
            (scale.yAxis === ScaleEnum.Linear || y > 0)
          ) {
            if (yValuesPerX.hasOwnProperty(value)) {
              if (!yValuesPerX[value].includes(y)) {
                yValuesPerX[value].push(y);
              }
            } else {
              yValuesPerX[value] = [y];
            }
          }
        }
      }
    }

    const xValues = Object.keys(yValuesPerX)
      .map((x) => +x)
      .sort((a: number, b: number) => a - b);

    const area: IAggregationData['area'] = {
      min: null,
      max: null,
    };

    let line: IAggregationData['line'] = null;

    switch (methods.line) {
      case AggregationLineMethods.MIN:
        line = {
          xValues: xValues,
          yValues: xValues.map((x) => _.min(yValuesPerX[x])) as number[],
        };
        break;
      case AggregationLineMethods.MAX:
        line = {
          xValues: xValues,
          yValues: xValues.map((x) => _.max(yValuesPerX[x])) as number[],
        };
        break;
      case AggregationLineMethods.MEAN:
        line = {
          xValues: xValues,
          yValues: xValues.map(
            (x) => _.sum(yValuesPerX[x]) / yValuesPerX[x].length,
          ) as number[],
        };
        break;
      case AggregationLineMethods.MEDIAN:
        line = {
          xValues: xValues,
          yValues: xValues.map((x) =>
            getValuesMedian(yValuesPerX[x]),
          ) as number[],
        };
        break;
      default:
    }

    switch (methods.area) {
      case AggregationAreaMethods.MIN_MAX:
        area.min = {
          xValues: xValues,
          yValues: xValues.map((x) => _.min(yValuesPerX[x])) as number[],
        };
        area.max = {
          xValues: xValues,
          yValues: xValues.map((x) => _.max(yValuesPerX[x])) as number[],
        };
        break;
      case AggregationAreaMethods.STD_DEV:
      case AggregationAreaMethods.STD_ERR:
      case AggregationAreaMethods.CONF_INT:
        let stepValues: { [key: number]: { min: number; max: number } } = {};
        xValues.forEach((x) => {
          const mean = _.sum(yValuesPerX[x]) / yValuesPerX[x].length;

          const distancesFromAvg = yValuesPerX[x].map((value) =>
            Math.pow(mean - value, 2),
          );
          const sum = _.sum(distancesFromAvg);
          const stdDevValue = Math.sqrt(sum / (yValuesPerX[x].length - 1 || 1));

          if (methods.area === AggregationAreaMethods.STD_DEV) {
            stepValues[x] = {
              min: mean - stdDevValue,
              max: mean + stdDevValue,
            };
          } else if (methods.area === AggregationAreaMethods.STD_ERR) {
            const stdErrValue = stdDevValue / Math.sqrt(yValuesPerX[x].length);
            stepValues[x] = {
              min: mean - stdErrValue,
              max: mean + stdErrValue,
            };
          } else if (methods.area === AggregationAreaMethods.CONF_INT) {
            const zValue = 1.96; // for 95% confidence level
            const CI =
              zValue * (stdDevValue / Math.sqrt(yValuesPerX[x].length));
            stepValues[x] = {
              min: mean - CI,
              max: mean + CI,
            };
          }
        });

        area.min = {
          xValues: xValues,
          yValues: xValues.map((x) => stepValues[x].min) as number[],
        };
        area.max = {
          xValues: xValues,
          yValues: xValues.map((x) => stepValues[x].max) as number[],
        };
        break;
      default:
    }

    groupsWithAggregation.push({
      ...group,
      aggregation: {
        line,
        area,
      },
    });
  }

  return groupsWithAggregation;
}

function getValuesMedian(values: number[]): number {
  values.sort((a, b) => a - b);
  const length = values.length;
  if (length % 2 === 0) {
    return (values[length / 2] + values[length / 2 - 1]) / 2;
  }

  return values[(length - 1) / 2];
}
