import React from 'react';
import { Box, Switch } from '@material-ui/core';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';
import Button from 'components/Button/Button';

import './StrokePopoverAdvanced.scss';

function StrokePopoverAdvanced({
  onPersistenceChange,
  onShuffleChange,
  persistence,
  groupingData,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  function isShuffleDisabled(): boolean {
    if (groupingData.reverseMode.stroke || groupingData.stroke.length > 0) {
      return false;
    }
    return true;
  }
  return (
    <Box className='StrokePopoverAdvanced'>
      <div className='StrokePopoverAdvanced__container'>
        <h3 className='subtitle'>Stroke Style persistence</h3>
        <span className='StrokePopoverAdvanced__container__span'>
          Enable persistent mode for stroke styles so that each group always has
          the same stroke style regardless to its order
        </span>
        <div className='flex fac fjb'>
          <div>
            <Switch
              color='primary'
              checked={persistence}
              onChange={() => onPersistenceChange('stroke')}
            />
            <span className='ColorPopoverAdvanced__container__span'>
              Enable
            </span>
          </div>
          {persistence && (
            <Button
              onClick={() => onShuffleChange('stroke')}
              disabled={isShuffleDisabled()}
              variant='contained'
              size='small'
            >
              Shuffle
            </Button>
          )}
        </div>
      </div>
    </Box>
  );
}

export default StrokePopoverAdvanced;
