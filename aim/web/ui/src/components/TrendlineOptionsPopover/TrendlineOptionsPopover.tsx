import React from 'react';
import classNames from 'classnames';

import { MenuItem } from '@material-ui/core';

import { Text, Slider } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { TrendlineTypeEnum } from 'utils/d3';

import { ITrendlineOptionsPopoverProps } from './TrendlineOptionsPopover.d';

import './TrendlineOptionsPopover.scss';

function TrendlineOptionsPopover({
  trendlineOptions,
  onChangeTrendlineOptions,
}: ITrendlineOptionsPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function onTypeSelect(e: React.ChangeEvent<any>): void {
    const type = e.target?.getAttribute('data-name');
    if (trendlineOptions.type !== type) {
      onChangeTrendlineOptions({
        type,
      });
    }
  }

  function onBandwidthChange(
    event: React.ChangeEvent<{}>,
    value: number | number[],
  ) {
    if (trendlineOptions.bandwidth !== value) {
      onChangeTrendlineOptions({
        bandwidth: value as number,
      });
    }
  }

  return (
    <ErrorBoundary>
      <div className='TrendlineOptionsPopover'>
        <div className='TrendlineOptionsPopover__section'>
          <MenuItem
            property='line'
            data-name={TrendlineTypeEnum.SLR}
            selected={trendlineOptions.type === TrendlineTypeEnum.SLR}
            onClick={onTypeSelect}
          >
            Simple Linear Regression
          </MenuItem>
          <MenuItem
            property='line'
            data-name={TrendlineTypeEnum.LOESS}
            selected={trendlineOptions.type === TrendlineTypeEnum.LOESS}
            onClick={onTypeSelect}
          >
            LOESS
          </MenuItem>
          <div
            className={classNames({
              TrendlineOptionsPopover__bandwidth: true,
              'TrendlineOptionsPopover__bandwidth--disabled':
                trendlineOptions.type !== TrendlineTypeEnum.LOESS,
            })}
          >
            <div className='TrendlineOptionsPopover__bandwidth__value'>
              <Text
                tint={50}
                component='h4'
                className='TrendlineOptionsPopover__bandwidth__value__subtitle'
              >
                bandwidth:
              </Text>
              <Text className='TrendlineOptionsPopover__bandwidth__value__number'>
                {trendlineOptions.bandwidth}
              </Text>
            </div>
            <div className='TrendlineOptionsPopover__bandwidth__Slider'>
              <Text>0.0</Text>
              <Slider
                valueLabelDisplay='auto'
                getAriaValueText={(val) => `${val}`}
                value={trendlineOptions.bandwidth}
                onChange={onBandwidthChange}
                aria-labelledby='track-false-slider'
                track={false}
                step={0.01}
                max={1}
                min={0}
              />
              <Text>1.0</Text>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(TrendlineOptionsPopover);
