import React, { memo } from 'react';
import { noop } from 'lodash-es';

import LineChart from 'components/LineChart/LineChart';
import contextToString from 'utils/contextToString';
import COLORS from 'config/colors/colors';
import { CurveEnum, ScaleEnum } from 'utils/d3';
import SelectTag from 'components/SelectTag/SelectTag';

function RunMetricCard({
  batch,
  index,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='RunDetailMetricsTab__container__chartContainer'>
      <div className='RunDetailMetricsTab__container__chartContainer__chartBox'>
        <LineChart
          data={[
            {
              key:
                batch.metric_name + contextToString(batch.context, 'keyHash'),
              data: {
                xValues: [...batch.iters],
                yValues: [...batch.values],
              },
              color: '#1c2852',
              dasharray: '0',
              selectors: [
                batch.metric_name + contextToString(batch.context, 'keyHash'),
              ],
            },
          ]}
          index={index}
          syncHoverState={noop}
          axesScaleType={{
            xAxis: ScaleEnum.Linear,
            yAxis: ScaleEnum.Linear,
          }}
          displayOutliers
          highlightMode={0}
          curveInterpolation={CurveEnum.Linear}
        />
      </div>
      <div className='RunDetailMetricsTab__container__chartContainer__metricDetailBox'>
        <p className='RunDetailMetricsTab__container__chartContainer__metricDetailBox__title'>
          Metric
        </p>
        <p className='RunDetailMetricsTab__container__chartContainer__metricDetailBox__metricName'>
          {batch?.metric_name}
        </p>
        {contextToString(batch?.context)
          ?.split(',')
          .map((label: string, i: number) => (
            <SelectTag
              key={index}
              color={COLORS[0][(i + index) % COLORS[0].length]}
              label={label || ''}
            />
          ))}
      </div>
    </div>
  );
}

export default memo(RunMetricCard);
