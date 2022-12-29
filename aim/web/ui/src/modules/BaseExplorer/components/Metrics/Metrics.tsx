import * as React from 'react';

import LineChart from 'components/LineChart/LineChart';

import { IBoxProps } from 'modules/BaseExplorer/types';

import {
  IActivePoint,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import { ILineChartRef } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

import { ScaleEnum } from 'utils/d3';

const EVENT = {
  MOUSE_LEAVE: 'onMouseLeave',
  MOUSE_MOVE: 'onMouseMove',
};

function Metrics(props: IBoxProps) {
  const {
    visualizationName,
    engine,
    data,
    index,
    id,
    engine: { useStore },
  } = props;

  let [chartData, setChartData] = React.useState<any>(null);

  let containerRef = React.useRef<HTMLDivElement | null>(null);
  let chartRef = React.useRef<ILineChartRef>(null);

  const focusedState = useStore((state: any) => state.focusedState);

  const setFocusedState = React.useCallback(
    (activePoint: IActivePoint, focusedStateActive: boolean = false) => {
      const state: IFocusedState = {
        active: focusedStateActive,
        key: activePoint.key,
        xValue: activePoint.xValue,
        yValue: activePoint.yValue,
        chartIndex: activePoint.chartIndex,
        chartId: activePoint.chartId,
      };
      chartRef.current?.setFocusedState(state);
      return state;
    },
    [],
  );

  const onChartMouseLeave = React.useCallback(() => {
    if (typeof chartRef.current?.clearHoverAttributes === 'function') {
      chartRef.current.clearHoverAttributes();
    }
  }, []);

  const onChartMouseMove = React.useCallback(
    ({
      state,
      dataSelector,
    }: {
      state: IFocusedState;
      dataSelector?: string;
    }) => {
      if (state.chartId === id) {
        if (state.active !== focusedState.active) {
          engine.focusedState.update(state, true);
        }
        return;
      }
      window.requestAnimationFrame(() => {
        if (chartRef.current) {
          chartRef.current?.setFocusedState(state);
          chartRef.current.updateHoverAttributes(
            state.xValue as number,
            dataSelector,
          );
        }
      });
    },
    [id, focusedState.active, engine.focusedState],
  );

  const syncHoverState = React.useCallback(
    ({
      activePoint,
      focusedStateActive = false,
      dataSelector,
    }: ISyncHoverStateArgs): void => {
      if (activePoint === null) {
        engine.events.fire(EVENT.MOUSE_LEAVE, null);
      } else {
        const state = setFocusedState(activePoint, focusedStateActive);
        engine.events.fire(EVENT.MOUSE_MOVE, { state, dataSelector });
      }
    },
    [engine.events, setFocusedState],
  );

  React.useEffect(() => {
    let rafId = window.requestAnimationFrame(() => {
      const chartData = (data || []).map((item: any) => ({
        key: item.key,
        data: item.data,
        color: item.style.color,
        dasharray: item.style.dasharray,
        selectors: [item.key],
      }));
      setChartData(chartData);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [data]);

  React.useEffect(() => {
    const unsubscribeLeave = engine.events.on(
      EVENT.MOUSE_LEAVE,
      onChartMouseLeave,
    );
    const unsubscribeMove = engine.events.on(
      EVENT.MOUSE_MOVE,
      onChartMouseMove,
    );
    return () => {
      unsubscribeLeave();
      unsubscribeMove();
    };
  }, [engine.events, onChartMouseLeave, onChartMouseMove]);

  React.useEffect(() => {
    if (focusedState) {
      chartRef.current?.setFocusedState(focusedState);
    }
  }, [focusedState]);

  return chartData ? (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: 20,
      }}
      ref={containerRef}
    >
      <LineChart
        ref={chartRef}
        nameKey={visualizationName}
        index={index}
        id={id}
        data={chartData}
        syncHoverState={syncHoverState}
        axesScaleType={{
          xAxis: ScaleEnum.Linear,
          yAxis: ScaleEnum.Linear,
        }}
        margin={{
          top: 30,
          right: 40,
          bottom: 30,
          left: 60,
        }}
      />
    </div>
  ) : null;
}

export default React.memo(Metrics);
