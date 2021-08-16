import React from 'react';
import { Box, Divider, MenuItem, MenuList } from '@material-ui/core';
import { IAggregationPopoverProps } from 'types/components/AggregationPopover/AggregationPopover';
import {
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';

function AggregationPopover({
  aggregation,
  onChange,
}: IAggregationPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function handleClick(e: React.ChangeEvent<any>): void {
    const methodKey: 'area' | 'line' = e.target?.getAttribute('property');
    const value = e.target?.getAttribute('data-name');
    if (
      methodKey &&
      value &&
      aggregation.methods[methodKey] !== parseInt(value) &&
      typeof onChange === 'function'
    ) {
      onChange({
        methods: {
          ...aggregation.methods,
          [methodKey]: parseInt(value),
        },
      });
    }
  }

  return (
    <Box>
      <Box p={0.5}>Select Aggregation Method</Box>
      <Divider />
      <Box p={0.5}>Select Line:</Box>
      <MenuList>
        <MenuItem
          property='line'
          data-name={AggregationLineMethods.MEAN}
          selected={aggregation.methods.line === AggregationLineMethods.MEAN}
          onClick={handleClick}
        >
          Mean
        </MenuItem>
        <MenuItem
          property='line'
          data-name={AggregationLineMethods.MEDIAN}
          selected={aggregation.methods.line === AggregationLineMethods.MEDIAN}
          onClick={handleClick}
        >
          Median
        </MenuItem>
        <MenuItem
          property='line'
          data-name={AggregationLineMethods.MIN}
          selected={aggregation.methods.line === AggregationLineMethods.MIN}
          onClick={handleClick}
        >
          Min
        </MenuItem>
        <MenuItem
          property='line'
          data-name={AggregationLineMethods.MAX}
          selected={aggregation.methods.line === AggregationLineMethods.MAX}
          onClick={handleClick}
        >
          Max
        </MenuItem>
      </MenuList>
      <Divider />
      <Box p={0.5}>Select Area:</Box>
      <MenuList>
        <MenuItem
          property='area'
          data-name={AggregationAreaMethods.NONE}
          selected={aggregation.methods.area === AggregationAreaMethods.NONE}
          onClick={handleClick}
        >
          None
        </MenuItem>
        <MenuItem
          property='area'
          data-name={AggregationAreaMethods.MIN_MAX}
          selected={aggregation.methods.area === AggregationAreaMethods.MIN_MAX}
          onClick={handleClick}
        >
          Min/Max
        </MenuItem>
        <MenuItem
          property='area'
          data-name={AggregationAreaMethods.STD_DEV}
          selected={aggregation.methods.area === AggregationAreaMethods.STD_DEV}
          onClick={handleClick}
        >
          Mean ± Standard Deviation
        </MenuItem>
        <MenuItem
          property='area'
          data-name={AggregationAreaMethods.STD_ERR}
          selected={aggregation.methods.area === AggregationAreaMethods.STD_ERR}
          onClick={handleClick}
        >
          Mean ± Standard Error
        </MenuItem>
        <MenuItem
          property='area'
          data-name={AggregationAreaMethods.CONF_INT}
          selected={
            aggregation.methods.area === AggregationAreaMethods.CONF_INT
          }
          onClick={handleClick}
        >
          Confidence Interval (95%)
        </MenuItem>
      </MenuList>
    </Box>
  );
}

export default React.memo(AggregationPopover);
