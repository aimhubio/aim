import React from 'react';
import { Box } from '@material-ui/core';

import ToggleButton from 'components/ToggleButton/ToggleButton';

function StylePopoverAdvanced(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box className='advancedPopover_container'>
      <div>
        <h3>Stroke Style persistence:</h3>
        <span>
          Enable persistent mode for stroke styles so that each group always has
          the same stroke style regardless to its order
        </span>
        <div>
          <ToggleButton
            id='persistence'
            leftLabel='Enabled'
            defaultChecked
            onChange={() => {}}
          />
        </div>
      </div>
    </Box>
  );
}

export default StylePopoverAdvanced;
