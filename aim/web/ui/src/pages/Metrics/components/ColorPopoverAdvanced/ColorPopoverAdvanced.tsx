import React from 'react';
import { Box, Radio, Switch } from '@material-ui/core';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';
import COLORS from 'config/colors/colors';
import Button from 'components/Button/Button';

import './ColorPopoverAdvanced.scss';
import Switcher from 'components/Switcher/Switcher';

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
    if (groupingData.reverseMode.color || groupingData.color.length > 0) {
      return false;
    }
    return true;
  }

  return (
    <div className='ColorPopoverAdvanced__container'>
      <div className='ColorPopoverAdvanced__persistence'>
        <h3 className='subtitle'>colors persistence</h3>
        <p className='ColorPopoverAdvanced__persistence__p'>
          Enable persistent coloring mode so that each item always has the same
          color regardless of its order.
        </p>
        <div className='flex fac fjb'>
          <div className='ColorPopoverAdvanced__Switcher__button__container'>
            <Switcher
              onChange={() => onPersistenceChange('color')}
              checked={persistence}
              size='large'
            />
            <span className='ColorPopoverAdvanced__container__span'>
              Enable
            </span>
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
        <h3 className='subtitle'>Preferred color palette:</h3>
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
              <span className='ColorPopoverAdvanced__container__span'>
                {index === 0 ? '8 distinct colors' : '24 colors'}{' '}
              </span>
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
