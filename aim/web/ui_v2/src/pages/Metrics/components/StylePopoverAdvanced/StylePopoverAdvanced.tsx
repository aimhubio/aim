import React from 'react';
import { Box } from '@material-ui/core';

import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';

function StylePopoverAdvanced({
  onPersistenceChange,
  persistence,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box className='AdvancedPopover__container'>
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
            defaultChecked={persistence}
            value={persistence}
            onChange={() => onPersistenceChange('style')}
          />
        </div>
      </div>
    </Box>
  );
}

export default StylePopoverAdvanced;
