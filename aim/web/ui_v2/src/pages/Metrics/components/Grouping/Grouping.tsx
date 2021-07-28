import React from 'react';
import { Box, Divider, Grid } from '@material-ui/core';
import GroupingItem from '../GroupingItem/GroupingItem';

function Grouping(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box>Group selected metrics By:</Box>
      <Grid container spacing={1} justify='center' alignItems='center'>
        <Grid item>
          <GroupingItem
            groupName='Color'
            groupPopup={<div>GroupPopup</div>}
            advancedPopup={<div>Advance Popup</div>}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
        <Grid item>
          <GroupingItem
            groupName='Style'
            groupPopup={<div>GroupPopup</div>}
            advancedPopup={<div>Advance Popup</div>}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
        <Grid item>
          <GroupingItem
            groupName='Chart'
            groupPopup={<div>GroupPopup</div>}
            advancedPopup={<div>Advance Popup</div>}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default React.memo(Grouping);
