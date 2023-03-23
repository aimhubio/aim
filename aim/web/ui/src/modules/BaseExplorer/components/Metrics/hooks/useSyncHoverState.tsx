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
type FocusPoint = (currentFocusedState: IFocusedState) => void;
type SyncHoverState = ({
  activePoint,
  focusedState: currentFocusedState,
  dataSelector,
}: ISyncHoverStateArgs) => void;

function useSyncHoverState(
  engine: IBaseComponentProps['engine'],
  chartRef: React.RefObject<ILineChartRef>,
  updateActiveElement: (activePoint: IActivePoint | null) => void,
  id?: string,
): SyncHoverState {
  const focusedState = engine.useStore(engine.focusedState.stateSelector);
  const focusedStateRef = React.useRef<IFocusedState>(focusedState);

  /**
    The "syncHoverState" function is only a function for distributing an events correct firing at a time.
    The "syncHoverState" function is not a function for changing the state of the application.
    The state of the application will be changed by the "focus point" and the "mouse move" reducer.
   */
  const syncHoverState: SyncHoverState = React.useCallback(
    ({ activePoint, focusedState: currentFocusedState, dataSelector }) => {
      if (activePoint) {
        /** on mouse over */
        engine.events.fire(EVENT.MOUSE_MOVE, { activePoint, dataSelector });

        /** on focus point */
        if (
          currentFocusedState?.active !== focusedStateRef.current.active ||
          (focusedStateRef.current.active &&
            activePoint.key !== focusedStateRef.current.key)
        ) {
          engine.events.fire(EVENT.FOCUS_POINT, currentFocusedState);
        }
      } else {
        /** on mouse leave */
        engine.events.fire(EVENT.MOUSE_LEAVE);
      }
    },
    [engine.events],
  );

  React.useLayoutEffect(() => {
    /**
     * Set focused state in each re-render of the component
     */
    chartRef.current?.setFocusedState(focusedState);
    focusedStateRef.current = focusedState;
  });

  React.useEffect(() => {
    const onMouseLeave: MouseLeave = () => {
      if (!chartRef.current) return;

      updateActiveElement(null);
      chartRef.current.clearHoverAttributes();
    };

    const unsubscribe = engine.events.on(EVENT.MOUSE_LEAVE, onMouseLeave);
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.events, chartRef.current, updateActiveElement]);

  React.useEffect(() => {
    const onMouseMove: MouseMove = ({ activePoint, dataSelector }) => {
      if (!chartRef.current) return;

      if (activePoint.visId === id) {
        updateActiveElement(activePoint);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.events, chartRef.current, id, updateActiveElement]);

  React.useEffect(() => {
    const onFocusPoint: FocusPoint = (currentState) => {
      if (!chartRef.current) return;

      chartRef.current.setFocusedState(currentState);

      if (currentState.visId === id) {
        if (!_.isEqual(focusedStateRef.current, currentState)) {
          engine.focusedState.update(currentState);
        }
      }
      focusedStateRef.current = currentState;
    };

    const unsubscribe = engine.events.on(EVENT.FOCUS_POINT, onFocusPoint);
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.events, engine.focusedState, chartRef.current, id]);

  return syncHoverState;
}

export default useSyncHoverState;
