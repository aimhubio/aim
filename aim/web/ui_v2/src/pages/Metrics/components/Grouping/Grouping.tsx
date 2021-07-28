import React from 'react';
import { Box, Divider, Grid } from '@material-ui/core';
import GroupingItem from '../GroupingItem/GroupingItem';
import ColorPopover from 'components/ColorPopover/ColorPopover';
import ColorPopoverAdvanced from 'components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import StylePopover from 'components/StylePopover/StylePopover';
import StylePopoverAdvanced from 'components/StylePopoverAdvanced/StylePopoverAdvanced';
import DivideChartsPopover from 'components/DivideChartsPopover/DivideChartsPopover';

function Grouping(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box>
      <Box>Group selected metrics By:</Box>
      <Grid container spacing={1} justify='center' alignItems='center'>
        <Grid item>
          <GroupingItem
            title='Run Color Settings'
            advancedTitle='Color Advanced Options'
            groupName='Color'
            groupPopover={<ColorPopover />}
            advancedPopover={
              <Box p={0.5}>
                <ColorPopoverAdvanced
                  onPersistenceChange={() => null}
                  onPaletteChange={(e: any) => null}
                  selectedPersistence={1}
                />
              </Box>
            }
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
        <Grid item>
          <GroupingItem
            title='Select Fields For Grouping by stroke style'
            advancedTitle=''
            groupName='Style'
            groupPopover={<StylePopover />}
            advancedPopover={<StylePopoverAdvanced />}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
        <Grid item>
          <GroupingItem
            title='Select fields to divide into charts'
            groupName='Chart'
            groupPopover={<DivideChartsPopover />}
            advancedPopover={<div>Advanced Popup</div>}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default React.memo(Grouping);
