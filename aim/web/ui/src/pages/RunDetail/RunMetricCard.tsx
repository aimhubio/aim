import * as React from 'react';

import { Tooltip } from '@material-ui/core';

import LineChart from 'components/LineChart/LineChart';
import { Badge, Text, Button, Spinner, Icon } from 'components/kit';
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
  observer,
  isPinned,
  togglePin,
}: IRunMetricCardProps): React.FunctionComponentElement<React.ReactNode> {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current && observer) {
      observer.observe(containerRef.current!);
    }
  }, [observer]);

  return (
    <ErrorBoundary>
      <div
        className='RunDetailMetricsTab__container__chartContainer'
        data-name={batch.name}
        data-context={contextToString(batch.context)}
        ref={containerRef}
      >
        <div className='RunDetailMetricsTab__container__chartContainer__chartBox'>
          {batch.iters ? (
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
          ) : (
            <Spinner />
          )}
        </div>
        <div className='RunDetailMetricsTab__container__chartContainer__metricDetailBox'>
          <div className='RunDetailMetricsTab__container__chartContainer__metricDetailBox__top'>
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
            <Button
              color={isPinned ? 'primary' : 'default'}
              size='small'
              variant={isPinned ? 'outlined' : 'text'}
              withOnlyIcon
              onClick={() =>
                togglePin(
                  {
                    name: batch.name,
                    context: batch.context,
                  },
                  isPinned,
                )
              }
            >
              <Tooltip title={isPinned ? 'Unpin' : 'Pin'}>
                <div className='RunDetailMetricsTab__container__chartContainer__metricDetailBox__pin'>
                  <Icon name='pin' />
                </div>
              </Tooltip>
            </Button>
          </div>
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

export default React.memo(RunMetricCard);
