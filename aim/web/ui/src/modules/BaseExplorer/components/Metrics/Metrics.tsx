import * as React from 'react';
import _ from 'lodash-es';

import LineChart from 'components/LineChart/LineChart';

import { IBoxProps } from 'modules/BaseExplorer/types';

import {
  IActivePoint,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';
import { ILineChartRef } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';

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
    engine: { useStore },
  } = props;
  const [chartData, setChartData] = React.useState(null);

  const chartRef = React.useRef<ILineChartRef>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { isInitial: isInitialFocusedState, ...focusedState } = useStore(
    engine.focusedState.stateSelector,
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
        syncHoverState={syncHoverState}
      />
    </div>
  ) : null;
}

Metrics.displayName = 'MetricsBox';

export default React.memo(Metrics);
