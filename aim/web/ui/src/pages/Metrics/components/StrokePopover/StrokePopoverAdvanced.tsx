import React from 'react';
import { Box } from '@material-ui/core';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';
import { Button, Switcher, Text } from 'components/kit';

import './StrokePopoverAdvanced.scss';

function StrokePopoverAdvanced({
  onPersistenceChange,
  onShuffleChange,
  persistence,
  groupingData,
}: IGroupingPopoverAdvancedProps): React.FunctionComponentElement<React.ReactNode> {
  function isShuffleDisabled(): boolean {
    if (groupingData?.reverseMode.stroke || groupingData?.stroke.length) {
      return false;
    }
    return true;
  }
  return (
    <Box className='StrokePopoverAdvanced'>
      <div className='StrokePopoverAdvanced__container'>
        <h3 className='subtitle'>Stroke Style persistence</h3>
        <Text
          component='p'
          weight={300}
          className='StrokePopoverAdvanced__container__p'
        >
          Enable persistent mode for stroke styles so that each group always has
          the same stroke style regardless to its order
        </Text>
        <div className='flex fac fjb'>
          <div className='StrokePopoverAdvanced__Switcher__button__container'>
            <Switcher
              color='primary'
              checked={persistence}
              onChange={() => onPersistenceChange('stroke')}
              size='large'
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
