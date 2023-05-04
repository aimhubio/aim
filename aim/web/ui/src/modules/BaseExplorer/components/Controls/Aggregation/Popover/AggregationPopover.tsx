import React from 'react';

import { Divider, MenuItem } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary';
import { Text } from 'components/kit';

import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

import { IAggregationConfig } from '../index';

import { IAggregationPopoverProps } from './index';

import './AggregationPopover.scss';

function AggregationPopover(props: IAggregationPopoverProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const aggregationConfig: IAggregationConfig = useStore(
    vizEngine.controls.aggregation.stateSelector,
  );
  const updateAggregationConfig = vizEngine.controls.aggregation.methods.update;

  const onAggregationChange = React.useCallback(
    (e): void => {
      const methodKey: 'area' | 'line' = e.target?.getAttribute('property');
      const value = e.target?.getAttribute('data-name');
      if (
        methodKey &&
        value &&
        aggregationConfig.methods[methodKey] !== parseInt(value) &&
        typeof updateAggregationConfig === 'function'
      ) {
        updateAggregationConfig({
          methods: {
            ...aggregationConfig.methods,
            [methodKey]: parseInt(value),
          },
        });
      }
    },
    [aggregationConfig, updateAggregationConfig],
  );

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
            onClick={onAggregationChange}
          >
            Mean
          </MenuItem>
          <MenuItem
            property='line'
            data-name={AggregationLineMethods.MEDIAN}
            selected={
              aggregationConfig.methods.line === AggregationLineMethods.MEDIAN
            }
            onClick={onAggregationChange}
          >
            Median
          </MenuItem>
          <MenuItem
            property='line'
            data-name={AggregationLineMethods.MIN}
            selected={
              aggregationConfig.methods.line === AggregationLineMethods.MIN
            }
            onClick={onAggregationChange}
          >
            Min
          </MenuItem>
          <MenuItem
            property='line'
            data-name={AggregationLineMethods.MAX}
            selected={
              aggregationConfig.methods.line === AggregationLineMethods.MAX
            }
            onClick={onAggregationChange}
          >
            Max
          </MenuItem>
        </div>
        <Divider className='AggregationPopover__divider' />
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
            onClick={onAggregationChange}
          >
            None
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.MIN_MAX}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.MIN_MAX
            }
            onClick={onAggregationChange}
          >
            Min/Max
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.STD_DEV}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.STD_DEV
            }
            onClick={onAggregationChange}
          >
            Mean ± Standard Deviation
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.STD_ERR}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.STD_ERR
            }
            onClick={onAggregationChange}
          >
            Mean ± Standard Error
          </MenuItem>
          <MenuItem
            property='area'
            data-name={AggregationAreaMethods.CONF_INT}
            selected={
              aggregationConfig.methods.area === AggregationAreaMethods.CONF_INT
            }
            onClick={onAggregationChange}
          >
            Confidence Interval (95%)
          </MenuItem>
        </div>
      </div>
    </ErrorBoundary>
  );
}

AggregationPopover.displayName = 'AggregationPopover';

export default React.memo(AggregationPopover);
