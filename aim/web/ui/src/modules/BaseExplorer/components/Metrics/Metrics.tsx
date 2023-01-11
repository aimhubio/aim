import * as React from 'react';
import _ from 'lodash-es';

import LineChart from 'components/LineChart/LineChart';

import { IBoxProps } from 'modules/BaseExplorer/types';

import { IAggregationConfig } from 'pages/MetricsExplorer/Controls/Aggregation';

import {
  IActivePoint,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import { ILine, ILineChartRef } from 'types/components/LineChart/LineChart';
import {
  IAggregationData,
  IFocusedState,
} from 'types/services/models/metrics/metricsAppModel';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';

import { ScaleEnum } from 'utils/d3';
import { getValuesMedian } from 'utils/getValuesMedian';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

const EVENT = {
  MOUSE_LEAVE: 'onMouseLeave',
  MOUSE_MOVE: 'onMouseMove',
  FOCUS_POINT: 'onFocusPoint',
};

function Metrics(props: IBoxProps) {
  const {
    visualizationName,
    engine,
    data,
    index,
    id,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];

  const [chartData, setChartData] = React.useState<ILine[][]>();
  const [aggregatedData, setAggregatedData] = React.useState<any>();

  const chartRef = React.useRef<ILineChartRef>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { isInitial: isInitialFocusedState, ...focusedState } = useStore(
    engine.focusedState.stateSelector,
  );
  const aggregation: IAggregationConfig = useStore(
    vizEngine.controls.aggregation.stateSelector,
  );

  const onChartFocusPoint = React.useCallback(
    (currentFocusedState: IFocusedState) => {
      if (currentFocusedState.chartId !== id) {
        chartRef.current?.setFocusedState(currentFocusedState);
        return;
      }
      if (!_.isEqual(focusedState, currentFocusedState)) {
        engine.focusedState.update(currentFocusedState);
      }
    },
    [id, engine.focusedState, focusedState],
  );

  const onChartMouseLeave = React.useCallback(() => {
    chartRef.current?.clearHoverAttributes();
  }, []);

  const onChartMouseMove = React.useCallback(
    ({
      activePoint,
      dataSelector,
    }: {
      activePoint: IActivePoint;
      dataSelector?: string;
    }) => {
      if (activePoint.chartId === id) {
        return;
      }
      window.requestAnimationFrame(() => {
        chartRef.current?.updateHoverAttributes(
          activePoint.xValue as number,
          dataSelector,
        );
      });
    },
    [id],
  );

  const syncHoverState = React.useCallback(
    ({
      activePoint,
      focusedState: currentFocusedState,
      dataSelector,
    }: ISyncHoverStateArgs): void => {
      if (activePoint === null) {
        engine.events.fire(EVENT.MOUSE_LEAVE);
        return;
      }
      engine.events.fire(EVENT.MOUSE_MOVE, {
        activePoint,
        dataSelector,
      });
      if (
        currentFocusedState?.active !== focusedState.active ||
        (focusedState.active && activePoint.key !== focusedState.key)
      ) {
        engine.events.fire(EVENT.FOCUS_POINT, currentFocusedState);
      }
    },
    [engine.events, focusedState.active, focusedState.key],
  );

  const updateVirtualizedChartHoverAttributes = React.useCallback(() => {
    const mouseMovePayload = engine.events.getEventPayload(EVENT.MOUSE_MOVE);
    if (mouseMovePayload) {
      window.requestAnimationFrame(() => {
        chartRef.current?.updateHoverAttributes(
          mouseMovePayload.activePoint.xValue as number,
          mouseMovePayload.dataSelector,
        );
      });
    }
  }, [engine.events]);

  React.useEffect(() => {
    let rafId = window.requestAnimationFrame(() => {
      const chartData = (data || []).map((item: any) => ({
        key: item.key,
        data: item.data,
        color: item.style.color,
        dasharray: item.style.dasharray,
        selectors: [item.key],
      }));

      setChartData((prevState) => {
        if (prevState && _.isEqual(prevState, chartData)) {
          return prevState;
        }
        return chartData;
      });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [data]);

  React.useEffect(() => {
    const unsubscribe = engine.events.on(EVENT.MOUSE_LEAVE, onChartMouseLeave);
    return () => unsubscribe();
  }, [engine.events, onChartMouseLeave]);

  React.useEffect(() => {
    const unsubscribe = engine.events.on(EVENT.MOUSE_MOVE, onChartMouseMove);
    return () => unsubscribe();
  }, [engine.events, onChartMouseMove]);

  React.useEffect(() => {
    const unsubscribe = engine.events.on(EVENT.FOCUS_POINT, onChartFocusPoint);
    return () => unsubscribe();
  }, [engine.events, onChartFocusPoint]);

  React.useEffect(() => {
    chartRef.current?.setFocusedState(focusedState);

    if (!focusedState.active) {
      updateVirtualizedChartHoverAttributes();
    }
  }, [focusedState, updateVirtualizedChartHoverAttributes]);

  React.useEffect(() => {
    if (aggregation.isApplied && chartData) {
      const aggregated = aggregateChartData(chartData, aggregation);
      setAggregatedData(aggregated);
    }
  }, [aggregation, chartData]);

  return chartData ? (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', padding: 10 }}
    >
      <LineChart
        ref={chartRef}
        id={id}
        nameKey={visualizationName}
        index={index}
        data={chartData}
        aggregatedData={aggregatedData}
        syncHoverState={syncHoverState}
      />
    </div>
  ) : null;
}

Metrics.displayName = 'MetricsBox';

export default React.memo(Metrics);

function aggregateChartData(
  data: any,
  config: IAggregationConfig,
  scale: IAxesScaleState = {
    yAxis: ScaleEnum.Linear,
    xAxis: ScaleEnum.Linear,
  },
) {
  const { methods } = config;

  const chartXValues: number[] = _.uniq(
    data
      .map((item: any) => item.data.xValues)
      .flat()
      .sort((a: number, b: number) => a - b),
  );
  const yValuesPerX: Record<string, number[]> = {};

  data.forEach((item: ILine) => {
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

  let area: IAggregationData['area'] = { min: null, max: null };
  let line: IAggregationData['line'] = null;

  switch (methods.line) {
    case AggregationLineMethods.MIN:
      line = {
        xValues: chartXValues,
        yValues: chartXValues.map((x) => _.min(yValuesPerX[x])) as number[],
      };
      break;
    case AggregationLineMethods.MAX:
      line = {
        xValues: chartXValues,
        yValues: chartXValues.map((x) => _.max(yValuesPerX[x])) as number[],
      };
      break;
    case AggregationLineMethods.MEAN:
      line = {
        xValues: chartXValues,
        yValues: chartXValues.map(
          (x) => _.sum(yValuesPerX[x]) / yValuesPerX[x].length,
        ) as number[],
      };
      break;
    case AggregationLineMethods.MEDIAN:
      line = {
        xValues: chartXValues,
        yValues: chartXValues.map((x) =>
          getValuesMedian(yValuesPerX[x]),
        ) as number[],
      };
      break;
    default:
  }
  switch (methods.area) {
    case AggregationAreaMethods.MIN_MAX:
      area.min = {
        xValues: chartXValues,
        yValues: chartXValues.map((x) => _.min(yValuesPerX[x])) as number[],
      };
      area.max = {
        xValues: chartXValues,
        yValues: chartXValues.map((x) => _.max(yValuesPerX[x])) as number[],
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
      chartXValues.forEach((x) => {
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
          const CI = zValue * (stdDevValue / Math.sqrt(yValuesPerX[x].length));
          stepValues[x] = {
            min: mean - CI,
            max: mean + CI,
          };
        }
      });

      area.min = {
        xValues: chartXValues,
        yValues: chartXValues.map((x) => stepValues[x].min) as number[],
      };
      area.max = {
        xValues: chartXValues,
        yValues: chartXValues.map((x) => stepValues[x].max) as number[],
      };

      if (methods.area === AggregationAreaMethods.STD_DEV) {
        area.stdDevValue = {
          xValues: chartXValues,
          yValues: chartXValues.map(
            (x) => stepValues[x].stdDevValue,
          ) as number[],
        };
      }

      if (methods.area === AggregationAreaMethods.STD_ERR) {
        area.stdErrValue = {
          xValues: chartXValues,
          yValues: chartXValues.map(
            (x) => stepValues[x].stdErrValue,
          ) as number[],
        };
      }
      break;
    default:
  }

  return {
    line,
    area,
  };
}
