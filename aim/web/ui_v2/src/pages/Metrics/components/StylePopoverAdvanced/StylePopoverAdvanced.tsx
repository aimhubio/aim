import React from 'react';
import { Box, Switch } from '@material-ui/core';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';

import './StylePopoverAdvanced.scss';

function StylePopoverAdvanced({
  onPersistenceChange,
  persistence,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box className='StylePopoverAdvanced'>
      <div className='StylePopoverAdvanced__container'>
        <h3 className='subtitle'>Stroke Style persistence</h3>
        <span className='StylePopoverAdvanced__container__span'>
          Enable persistent mode for stroke styles so that each group always has
          the same stroke style regardless to its order
        </span>
        <div>
          <Switch
            color='primary'
            defaultChecked={persistence}
            value={persistence}
            onChange={() => onPersistenceChange('style')}
          />
          <span className='ColorPopoverAdvanced__container__span'>Enable</span>
        </div>
      </div>
    </Box>
  );
}

export default StylePopoverAdvanced;
