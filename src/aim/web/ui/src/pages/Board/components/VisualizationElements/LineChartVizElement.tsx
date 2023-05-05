import * as React from 'react';
import * as _ from 'lodash-es';

import LineChart from 'components/LineChart/LineChart';

import { ILineChartRef } from 'types/components/LineChart/LineChart';

function LineChartVizElement(props: any) {
  const onActivePointChange = React.useCallback(
    _.debounce(props.callbacks?.on_active_point_change, 100),
    [],
  );
  const chartRef = React.useRef<ILineChartRef>(null);
  const focusedStateRef = React.useRef<any>(null);
  const activePointKeyRef = React.useRef<any>(null);

  const syncHoverState = React.useCallback(({ activePoint, focusedState }) => {
    if (activePoint) {
      if (focusedState?.active) {
        /** on focus point */

        if (focusedStateRef.current?.key !== focusedState?.key) {
          focusedStateRef.current = focusedState;
          activePointKeyRef.current = null;
          onActivePointChange(activePoint, true);
        }
      } else {
        /** on mouse over */

        focusedStateRef.current = null;
        if (activePointKeyRef.current !== activePoint.key) {
          activePointKeyRef.current = activePoint.key;
          onActivePointChange(activePoint, false);
        }
      }
    } else {
      /** on mouse leave */

      focusedStateRef.current = null;
      onActivePointChange(activePoint, false);
    }
  }, []);

  return (
    <div className='VizComponentContainer'>
      <LineChart
        ref={chartRef}
        id={'0'}
        nameKey={'board'}
        data={props.data}
        syncHoverState={syncHoverState}
      />
    </div>
  );
}

export default LineChartVizElement;
