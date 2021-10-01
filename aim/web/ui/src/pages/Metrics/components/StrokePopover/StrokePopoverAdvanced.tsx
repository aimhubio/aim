import React from 'react';
import { Box, Switch } from '@material-ui/core';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';

import './StrokePopoverAdvanced.scss';

function StrokePopoverAdvanced({
  onPersistenceChange,
  persistence,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box className='StrokePopoverAdvanced'>
      <div className='StrokePopoverAdvanced__container'>
        <h3 className='subtitle'>Stroke Style persistence</h3>
        <span className='StrokePopoverAdvanced__container__span'>
          Enable persistent mode for stroke styles so that each group always has
          the same stroke style regardless to its order
        </span>
        <div>
          <Switch
            color='primary'
            checked={persistence}
            onChange={() => onPersistenceChange('stroke')}
          />
          <span className='ColorPopoverAdvanced__container__span'>Enable</span>
        </div>
      </div>
    </Box>
  );
}

export default StrokePopoverAdvanced;
