import React from 'react';
import { Box, Grid } from '@material-ui/core';
import GroupingItem from '../GroupingItem/GroupingItem';
import ColorPopover from 'components/ColorPopover/ColorPopover';

function Grouping(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box>Group selected metrics By:</Box>
      <Grid container spacing={1} justify='center' alignItems='center'>
        <Grid item>
          <GroupingItem
            groupName='Color'
            groupPopover={<ColorPopover />}
            advancedPopover={<div>Advance Popup</div>}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
        <Grid item>
          <GroupingItem
            groupName='Style'
            groupPopover={<div>GroupPopup</div>}
            advancedPopover={<div>Advance Popup</div>}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
        <Grid item>
          <GroupingItem
            groupName='Chart'
            groupPopover={<div>GroupPopup</div>}
            advancedPopover={<div>Advance Popup</div>}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default React.memo(Grouping);
