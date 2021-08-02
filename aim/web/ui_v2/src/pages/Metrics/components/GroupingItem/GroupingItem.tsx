import React from 'react';
import { Box, Button } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { IGroupingItemProps } from 'types/pages/metrics/components/GroupingItem/GroupingItem';

function GroupingItem({
  groupPopover,
  advancedPopover,
  onReset,
  onVisibilityChange,
  groupName,
  title,
  advancedTitle,
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box className='groupingItem__container_div' mt={0.5}>
      <ControlPopover
        title={title}
        anchor={({ onAnchorClick }) => (
          <Button
            onClick={onAnchorClick}
            color='primary'
            variant='text'
            size='small'
          >
            {groupName}
          </Button>
        )}
        component={groupPopover}
      />

      <Box mt={0.75} display='flex' justifyContent='space-between'>
        <ControlPopover
          title={advancedTitle}
          anchor={({ onAnchorClick }) => (
            <Box
              className={'groupingItem__button_small'}
              onClick={onAnchorClick}
            >
              A
            </Box>
          )}
          component={advancedPopover}
        />
        <Box
          className='groupingItem__button_small'
          onClick={onVisibilityChange}
        >
          V
        </Box>
        <Box className='groupingItem__button_small' onClick={onReset}>
          X
        </Box>
      </Box>
    </Box>
  );
}

export default React.memo(GroupingItem);
