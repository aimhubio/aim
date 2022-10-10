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

  return (
    <div
      style={{
        width: 'calc(100% - 2px)',
        height: '100%',
        position: 'relative',
      }}
    >
      <LineChart
        data={data}
        index={0}
        axesScaleType={{
          xAxis: ScaleEnum.Linear,
          yAxis: ScaleEnum.Linear,
        }}
        ignoreOutliers={false}
        highlightMode={HighlightEnum.Metric}
        curveInterpolation={CurveEnum.Linear}
      />
    </div>
  );
}

export default CustomMetricVisualizer;
