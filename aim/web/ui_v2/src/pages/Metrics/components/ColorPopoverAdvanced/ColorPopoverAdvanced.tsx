import React from 'react';
import { Box, Radio } from '@material-ui/core';

import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';
import COLORS from 'config/colors/colors';

function ColorPopoverAdvanced({
  onPersistenceChange,
  onGroupingPaletteChange,
  persistence,
  paletteIndex,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  function onPaletteChange(e: React.ChangeEvent<HTMLInputElement>) {
    let { value } = e.target;
    if (onGroupingPaletteChange) {
      onGroupingPaletteChange(parseInt(value));
    }
  }
  return (
    <div className='AdvancedPopover__container'>
      <div>
        <h3>colors persistence:</h3>
        <span>
          Enable persistent coloring mode so that each item always has the same
          color regardless of its order.
        </span>
        <div>
          <ToggleButton
            id='persistence'
            leftLabel='Enabled'
            defaultChecked={persistence}
            value={persistence}
            onChange={() => onPersistenceChange('color')}
          />
        </div>
      </div>
      <Box pt={0.5} borderTop='1px solid #b7b7b7'>
        <h3>Preferred color palette:</h3>
        <div>
          {COLORS.map((options, index) => (
            <Box key={index} display='flex' alignItems='center'>
              <Radio
                checked={paletteIndex === index}
                onChange={onPaletteChange}
                size='small'
                value={index}
              />
              <div className='AdvancedPopover__paletteColors__container'>
                {options.map((color) => (
                  <Box
                    key={color}
                    component='span'
                    className='AdvancedPopover__paletteColors_colorItem'
                    bgcolor={color}
                  />
                ))}
              </div>
              <span>{index === 0 ? '8 distinct colors' : '24 colors'} </span>
            </Box>
          ))}
        </div>
      </Box>
    </div>
  );
}

export default ColorPopoverAdvanced;
