import React from 'react';

import LineChart from 'components/LineChart/LineChart';

import COLORS from 'config/colors/colors';

import {
  AlignmentOptionsEnum,
  CurveEnum,
  HighlightEnum,
  ScaleEnum,
} from 'utils/d3';
import { encode } from 'utils/encoder/encoder';
import { filterMetricsData } from 'utils/filterMetricData';

function CustomMetricVisualizer(props: any) {
  const chartRef = React.useRef(null);

  const a = React.useCallback((args: any) => {
    const { activePoint, focusedStateActive = false, dataSelector, key } = args;

    if (activePoint !== null) {
      //@ts-ignore
      chartRef.current?.setFocusedState?.({
        active: focusedStateActive,
        key: activePoint.key,
        xValue: activePoint.xValue,
        yValue: activePoint.yValue,
        chartIndex: activePoint.chartIndex,
      });
      if (key !== props.data.key + props.visualizationName) {
        //@ts-ignore
        chartRef.current?.updateHoverAttributes?.(
          activePoint.xValue,
          dataSelector,
        );
      }
    }
    // on MouseLeave
    else {
      //@ts-ignore
      chartRef.current?.clearHoverAttributes?.();
    }
  }, []);
  let data = props.items.map((item: any, i: number) => {
    let line = item.data;
    const { values, steps } = filterMetricsData(
      line,
      AlignmentOptionsEnum.STEP,
    );
    let key = encode({
      index: i,
      key: item.key,
    });
    return {
      key: key,
      data: {
        xValues: [...steps],
        yValues: [...values],
      },
      color: COLORS[0][i % COLORS[0].length],
      dasharray: 'none',
      selectors: [key],
    };
  });

  const syncHoverState = React.useCallback(
    (args: any): void => {
      props.engine.events.fire('syncHoverState', {
        ...args,
        key: props.data.key + props.visualizationName,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    props.engine.events.on('syncHoverState', a);

    return () => {
      props.engine.events.unsubscribe('syncHoverState', a);
    };
  }, []);

  return (
    <div
      style={{
        width: 'calc(100% - 2px)',
        height: '100%',
        position: 'relative',
      }}
    >
      <LineChart
        ref={chartRef}
        data={data}
        index={0}
        axesScaleType={{
          xAxis: ScaleEnum.Linear,
          yAxis: ScaleEnum.Linear,
        }}
        syncHoverState={syncHoverState}
        ignoreOutliers={false}
        highlightMode={HighlightEnum.Metric}
        curveInterpolation={CurveEnum.Linear}
      />
    </div>
  );
}

export default CustomMetricVisualizer;
