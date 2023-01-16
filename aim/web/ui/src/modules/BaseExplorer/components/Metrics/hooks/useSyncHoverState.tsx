import * as React from 'react';
import * as _ from 'lodash-es';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { ILineChartRef } from 'types/components/LineChart/LineChart';
import { IFocusedState } from 'types/services/models/metrics/metricsAppModel';
import {
  IActivePoint,
  ISyncHoverStateArgs,
} from 'types/utils/d3/drawHoverAttributes';

const EVENT = {
  MOUSE_LEAVE: 'MouseLeave',
  MOUSE_MOVE: 'MouseMove',
  FOCUS_POINT: 'FocusPoint',
};

type MouseMove = (args: {
  activePoint: IActivePoint;
  dataSelector?: string;
}) => void;
type MouseLeave = () => void;
type FocusPoint = (focusedState: IFocusedState) => void;

function useSyncHoverState(
  engine: IBaseComponentProps['engine'],
  chartRef: React.RefObject<ILineChartRef>,
  id?: string,
) {
  const focusedState = engine.useStore(engine.focusedState.stateSelector);

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
      engine.events.fire(EVENT.MOUSE_MOVE, { activePoint, dataSelector });
      if (
        currentFocusedState?.active !== focusedState.active ||
        (focusedState.active && activePoint.key !== focusedState.key)
      ) {
        engine.events.fire(EVENT.FOCUS_POINT, currentFocusedState);
      }
    },
    [engine.events, focusedState.active, focusedState.key],
  );

  React.useEffect(() => {
    /**
     * Set focused state in each re-render of the component
     */
    chartRef.current?.setFocusedState(focusedState);
  });

  React.useEffect(() => {
    if (!focusedState.active) {
      /**
       * If there is no focused state, we need to update the chart's active point
       */
      const mouseMovePayload = engine.events.getEventPayload(EVENT.MOUSE_MOVE);
      if (mouseMovePayload) {
        window.requestAnimationFrame(() => {
          chartRef.current?.updateHoverAttributes(
            mouseMovePayload.activePoint.xValue as number,
            mouseMovePayload.dataSelector,
          );
        });
      }
    }
  }, [engine.events, focusedState.active, chartRef]);

  React.useEffect(() => {
    const onMouseLeave: MouseLeave = () => {
      chartRef.current?.clearHoverAttributes();
    };

    const unsubscribe = engine.events.on(EVENT.MOUSE_LEAVE, onMouseLeave);
    return () => unsubscribe();
  }, [engine.events, chartRef]);

  React.useEffect(() => {
    const onMouseMove: MouseMove = ({ activePoint, dataSelector }) => {
      if (activePoint.chartId === id) {
        return;
      }
      window.requestAnimationFrame(() => {
        chartRef.current?.updateHoverAttributes(
          activePoint.xValue as number,
          dataSelector,
        );
      });
    };
    const unsubscribe = engine.events.on(EVENT.MOUSE_MOVE, onMouseMove);
    return () => unsubscribe();
  }, [engine.events, chartRef, id]);

  React.useEffect(() => {
    const onFocusPoint: FocusPoint = (currentFocusedState) => {
      if (currentFocusedState.chartId !== id) {
        chartRef.current?.setFocusedState(currentFocusedState);
        return;
      }
      if (!_.isEqual(_.omit(focusedState, 'isInitial'), currentFocusedState)) {
        engine.focusedState.update(currentFocusedState);
      }
    };

    const unsubscribe = engine.events.on(EVENT.FOCUS_POINT, onFocusPoint);
    return () => unsubscribe();
  }, [engine.events, engine.focusedState, chartRef, focusedState, id]);

  return syncHoverState;
}

export default useSyncHoverState;
