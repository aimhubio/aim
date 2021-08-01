import React from 'react';
import { Box, Radio } from '@material-ui/core';

import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IColorPopoverAdvancedProps } from 'types/components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import COLORS from 'config/colors/colors';

function ColorPopoverAdvanced({
  onPersistenceChange,
  onPaletteChange,
  selectedPersistence,
}: IColorPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='advancedPopover_container'>
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
            defaultChecked
            onChange={onPersistenceChange}
          />
        </div>
      </div>
      <Box pt={0.5} borderTop='1px solid #b7b7b7'>
        <h3>Preferred color palette:</h3>
        <div>
          {COLORS.map((options, index) => (
            <Box key={index} display='flex' alignItems='center'>
              <Radio
                checked={selectedPersistence === index}
                onChange={onPaletteChange}
                size='small'
                value={index}
              />
              <div className='palette_colorsContainer'>
                {options.map((color) => (
                  <Box
                    key={color}
                    component='span'
                    className='palette_span__colorItem'
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
