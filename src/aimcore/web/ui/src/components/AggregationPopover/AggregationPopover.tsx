import React from 'react';

import { Divider, MenuItem } from '@material-ui/core';

import { Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IAggregationPopoverProps } from 'types/components/AggregationPopover/AggregationPopover';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

import './AggregationPopover.scss';

function AggregationPopover({
  aggregationConfig,
  onChange,
}: IAggregationPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleClick(e: React.ChangeEvent<any>): void {
    const methodKey: 'area' | 'line' = e.target?.getAttribute('property');
    const value = e.target?.getAttribute('data-name');
    if (
      methodKey &&
      value &&
      aggregationConfig.methods[methodKey] !== parseInt(value) &&
      typeof onChange === 'function'
    ) {
      onChange({
        methods: {
          ...aggregationConfig.methods,
          [methodKey]: parseInt(value),
        },
      });
    }
  }

  return (
    <ErrorBoundary>
      <div className='AggregationPopover'>
        <Text component='h4' tint={50} className='AggregationPopover__subtitle'>
          Select Line:
        </Text>
        <div>
          <MenuItem
            property='line'
            data-name={AggregationLineMethods.MEAN}
            selected={
              aggregationConfig.methods.line === AggregationLineMethods.MEAN
            }
            onClick={handleClick}
          >
            Mean
          </MenuItem>
          <MenuItem
            property='line'
            data-name={AggregationLineMethods.MEDIAN}
            selected={
              aggregationConfig.methods.line === AggregationLineMethods.MEDIAN
            }
            onClick={handleClick}
          >
            Median
          </MenuItem>
          <MenuItem
            property='line'
            data-name={AggregationLineMethods.MIN}
            selected={
              aggregationConfig.methods.line === AggregationLineMethods.MIN
            }
            onClick={handleClick}
          >
            Min
          </MenuItem>
          <MenuItem
            property='line'
            data-name={AggregationLineMethods.MAX}
            selected={
              aggregationConfig.methods.line === AggregationLineMethods.MAX
            }
            onClick={handleClick}
          >
            Max
          </MenuItem>
        </div>
        <Divider className='AggregationPopover__Divider' />
        <Text component='h4' tint={50} className='AggregationPopover__subtitle'>
          Select Area:
        </Text>
        <div>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.NONE}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.NONE
            }
            onClick={handleClick}
          >
            None
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.MIN_MAX}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.MIN_MAX
            }
            onClick={handleClick}
          >
            Min/Max
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.STD_DEV}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.STD_DEV
            }
            onClick={handleClick}
          >
            Mean ± Standard Deviation
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.STD_ERR}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.STD_ERR
            }
            onClick={handleClick}
          >
            Mean ± Standard Error
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.CONF_INT}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.CONF_INT
            }
            onClick={handleClick}
          >
            Confidence Interval (95%)
          </MenuItem>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(AggregationPopover);
