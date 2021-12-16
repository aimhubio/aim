import React, { memo } from 'react';
import { noop } from 'lodash-es';

import LineChart from 'components/LineChart/LineChart';
import { Badge, Text } from 'components/kit';

import COLORS from 'config/colors/colors';

import contextToString from 'utils/contextToString';
import { CurveEnum, ScaleEnum } from 'utils/d3';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

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
          ignoreOutliers={false}
          highlightMode={0}
          curveInterpolation={CurveEnum.Linear}
        />
      </div>
      <div className='RunDetailMetricsTab__container__chartContainer__metricDetailBox'>
        <Text component='p' size={10}>
          Metric
        </Text>
        <Text
          component='h4'
          tint={100}
          size={18}
          weight={600}
          className='RunDetailMetricsTab__container__chartContainer__metricDetailBox__metricName'
        >
          {isSystemMetric(batch?.name)
            ? formatSystemMetricName(batch?.name)
            : batch?.name}
        </Text>
        {contextToString(batch?.context)
          ?.split(',')
          .map((label: string, i: number) => (
            <Badge
              key={index}
              size='large'
              color={COLORS[0][(i + index) % COLORS[0].length]}
              label={label || 'Empty context'}
            />
          ))}
      </div>
    </div>
  );
}

export default memo(RunMetricCard);
