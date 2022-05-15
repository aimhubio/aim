import React, { memo } from 'react';

import LineChart from 'components/LineChart/LineChart';
import { Badge, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';

import COLORS from 'config/colors/colors';

import contextToString from 'utils/contextToString';
import { CurveEnum, ScaleEnum } from 'utils/d3';
import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';

import { IRunMetricCardProps } from './types';

function RunMetricCard({
  batch,
  index,
}: IRunMetricCardProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className='RunDetailMetricsTab__container__chartContainer'>
        <div className='RunDetailMetricsTab__container__chartContainer__chartBox'>
          <ErrorBoundary>
            <LineChart
              data={[
                {
                  key: batch.key,
                  data: {
                    xValues: [...batch.iters],
                    yValues: [...batch.values],
                  },
                  color: '#1c2852',
                  dasharray: 'none',
                  selectors: [batch.key],
                },
              ]}
              index={index}
              axesScaleType={{
                xAxis: ScaleEnum.Linear,
                yAxis: ScaleEnum.Linear,
              }}
              ignoreOutliers={false}
              highlightMode={HighlightEnum.Off}
              curveInterpolation={CurveEnum.Linear}
            />
          </ErrorBoundary>
        </div>
        <div className='RunDetailMetricsTab__container__chartContainer__metricDetailBox'>
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
                key={i}
                monospace
                size='large'
                color={COLORS[0][(i + index) % COLORS[0].length]}
                label={label || 'Empty context'}
              />
            ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default memo(RunMetricCard);
