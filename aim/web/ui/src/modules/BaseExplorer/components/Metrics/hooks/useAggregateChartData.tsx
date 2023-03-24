import * as React from 'react';
import * as _ from 'lodash-es';

import COLORS from 'config/colors/colors';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';

import { GroupType } from 'modules/core/pipeline';
import { IBoxContentProps } from 'modules/BaseExplorer/types';
import {
  IAggregationConfig,
  IAggregatedData,
  IAggregationData,
} from 'modules/BaseExplorer/components/Controls/Aggregation';

import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { ILine } from 'types/components/LineChart/LineChart';

import { getValuesMedian } from 'utils/getValuesMedian';
import { ScaleEnum } from 'utils/d3';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

function useAggregateChartData(
  engine: IBoxContentProps['engine'],
  vizEngine: any,
  data: any[],
  axesScaleType: IAxesScaleState,
): [IAggregatedData[] | undefined, IAggregationConfig] {
  const config: IAggregationConfig = engine.useStore(
    vizEngine.controls.aggregation.stateSelector,
  );

  const aggrData = React.useMemo(() => {
    if (config.isApplied) {
      // @TODO: add state for pallet index from explorer config
      const palletIndex = 0;
      const groups = _.groupBy(data, 'groupKey');
      return aggregateChartData(groups, config, axesScaleType, palletIndex);
    }
  }, [data, config, axesScaleType]);

  return [aggrData, config];
}

export default useAggregateChartData;

function aggregateChartData(
  groups: Record<string, Array<any>>,
  config: IAggregationConfig,
  scale: IAxesScaleState = {
    yAxis: ScaleEnum.Linear,
    xAxis: ScaleEnum.Linear,
  },
  palletIndex: number = 0,
): IAggregatedData[] {
  const { methods } = config;

  const aggregatedData: IAggregatedData[] = [];

  let chartXValues: number[] = _.uniq(
    Object.values(groups)
      .flat()
      .map((item) => item.data.xValues)
      .flat()
      .sort((a, b) => a - b),
  );

  for (let [groupKey, group] of Object.entries(groups)) {
    const yValuesPerX: Record<string, number[]> = {};

    group.forEach((item: ILine) => {
      const { xValues, yValues } = item.data;
      // Calculate line value (y) for each X axis value in chart
      // Even for case when line does not have corresponding x value
      for (let j = 0; j < xValues.length - 1; j++) {
        const step = xValues[j];
        const point = yValues[j];
        const nextStep = xValues[j + 1];
        const nextPoint = yValues[j + 1];

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
    });

    const xValues = Object.keys(yValuesPerX)
      .map((x) => +x)
      .sort((a, b) => a - b);

    let area: IAggregationData['area'] = { min: null, max: null };
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
          yValues: xValues.map((x) => {
            return _.sum(yValuesPerX[x]) / yValuesPerX[x].length;
          }) as number[],
        };
        break;
      case AggregationLineMethods.MEDIAN:
        line = {
          xValues: xValues,
          yValues: xValues.map((x) => getValuesMedian(yValuesPerX[x])),
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
        let stepValues: {
          [key: number]: {
            min: number;
            max: number;
            stdDevValue?: number;
            stdErrValue?: number;
          };
        } = {};
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
              stdDevValue,
            };
          } else if (methods.area === AggregationAreaMethods.STD_ERR) {
            const stdErrValue = stdDevValue / Math.sqrt(yValuesPerX[x].length);
            stepValues[x] = {
              min: mean - stdErrValue,
              max: mean + stdErrValue,
              stdErrValue,
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

        if (methods.area === AggregationAreaMethods.STD_DEV) {
          area.stdDevValue = {
            xValues: xValues,
            yValues: xValues.map((x) => stepValues[x].stdDevValue) as number[],
          };
        }

        if (methods.area === AggregationAreaMethods.STD_ERR) {
          area.stdErrValue = {
            xValues: xValues,
            yValues: xValues.map((x) => stepValues[x].stdErrValue) as number[],
          };
        }
        break;
      default:
    }

    const pallet = COLORS[palletIndex];
    const colorOrder = group[0].groupInfo[GroupType.COLOR]?.order || 0;
    const dasharrayOrder = group[0].groupInfo[GroupType.STROKE]?.order || 0;

    aggregatedData.push({
      key: groupKey,
      line,
      area,
      color: pallet[colorOrder % pallet.length],
      dasharray: DASH_ARRAYS[dasharrayOrder % DASH_ARRAYS.length],
    });
  }

  return aggregatedData;
}
