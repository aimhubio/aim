import { Box, Button } from '@material-ui/core';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import React from 'react';

import { IGroupingItemProps } from 'types/pages/metrics/components/GroupingItem/GroupingItem';

function GroupingItem({
  groupPopup,
  advancedPopup,
  onReset,
  onVisibilityChange,
  groupName,
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box border='1px solid' borderRadius={4} padding='4px'>
      <ControlPopover
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
        component={groupPopup}
      />

      <Box mt={0.25} display='flex' justifyContent='space-between'>
        <ControlPopover
          anchor={({ onAnchorClick }) => (
            <Box
              border='1px solid'
              padding='0px 4px'
              borderRadius={4}
              onClick={onAnchorClick}
            >
              A
            </Box>
          )}
          component={advancedPopup}
        />
        <Box
          border='1px solid'
          padding='0px 4px'
          borderRadius={4}
          onClick={onVisibilityChange}
        >
          V
        </Box>
        <Box
          border='1px solid'
          padding='0px 4px'
          borderRadius={4}
          onClick={onReset}
        >
          X
        </Box>
      </Box>
    </Box>
  );
}

export default React.memo(GroupingItem);
