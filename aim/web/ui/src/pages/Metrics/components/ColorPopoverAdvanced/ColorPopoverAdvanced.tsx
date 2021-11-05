import React from 'react';

import { Box, Radio } from '@material-ui/core';

import { Button, Switcher, Text } from 'components/kit';

import COLORS from 'config/colors/colors';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';

import './ColorPopoverAdvanced.scss';

function ColorPopoverAdvanced({
  onPersistenceChange,
  onGroupingPaletteChange,
  onShuffleChange,
  persistence,
  paletteIndex,
  groupingData,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  function onPaletteChange(e: React.ChangeEvent<HTMLInputElement>) {
    let { value } = e.target;
    if (onGroupingPaletteChange) {
      onGroupingPaletteChange(parseInt(value));
    }
  }
  function isShuffleDisabled(): boolean {
    if (groupingData?.reverseMode.color || groupingData?.color.length) {
      return false;
    }
    return true;
  }

  return (
    <div className='ColorPopoverAdvanced'>
      <div className='ColorPopoverAdvanced__persistence'>
        <Text component='h3' size={12} tint={50}>
          colors persistence
        </Text>
        <Text
          component='p'
          size={14}
          className='ColorPopoverAdvanced__persistence__p'
        >
          Enable persistent coloring mode so that each item always has the same
          color regardless of its order.
        </Text>
        <div className='flex fac fjb'>
          <div className='ColorPopoverAdvanced__Switcher__button__container'>
            <Switcher
              onChange={() => onPersistenceChange('color')}
              checked={persistence}
              size='large'
              variant='contained'
            />
            <Text size={14} className='ColorPopoverAdvanced__span'>
              Enable
            </Text>
          </div>
          {persistence && (
            <Button
              disabled={isShuffleDisabled()}
              onClick={() => onShuffleChange('color')}
              variant='contained'
              size='small'
            >
              Shuffle
            </Button>
          )}
        </div>
      </div>
      <div className='ColorPopoverAdvanced__preferred__colors'>
        <Text component='h3' tint={50}>
          Preferred color palette
        </Text>
        <div>
          {COLORS.map((options, index) => (
            <Box key={index} display='flex' alignItems='center'>
              <Radio
                color='primary'
                checked={paletteIndex === index}
                onChange={onPaletteChange}
                size='small'
                value={index}
              />
              <Text size={14} className='ColorPopoverAdvanced__span'>
                {index === 0 ? '8 distinct colors' : '24 colors'}{' '}
              </Text>
              <div
                className={`ColorPopoverAdvanced__paletteColors__container ${
                  paletteIndex === index ? 'active' : ''
                }`}
              >
                {options.map((color) => (
                  <Box
                    key={color}
                    component='span'
                    className='ColorPopoverAdvanced__paletteColors_colorItem'
                    bgcolor={color}
                  />
                ))}
              </div>
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ColorPopoverAdvanced;
