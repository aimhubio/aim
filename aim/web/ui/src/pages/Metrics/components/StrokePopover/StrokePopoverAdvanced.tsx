import React from 'react';

import { Button, Switcher, Text } from 'components/kit';

import { IGroupingPopoverAdvancedProps } from 'types/components/GroupingPopover/GroupingPopover';

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
    <div className='StrokePopoverAdvanced'>
      <div className='StrokePopoverAdvanced__container'>
        <Text component='h3' size={12} tint={50}>
          Stroke Style persistence
        </Text>
        <Text
          component='p'
          size={14}
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
            <Text size={14} className='ColorPopoverAdvanced__container__span'>
              Enable
            </Text>
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
    </div>
  );
}

export default StrokePopoverAdvanced;
