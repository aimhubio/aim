import React from 'react';
import { Box, Grid } from '@material-ui/core';

import GroupingItem from '../GroupingItem/GroupingItem';
import ColorPopoverAdvanced from 'pages/Metrics/components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import StylePopoverAdvanced from 'pages/Metrics/components/StylePopoverAdvanced/StylePopoverAdvanced';

import './groupingStyle.scss';
import { IGroupingProps } from 'types/pages/metrics/components/Grouping/Grouping';
import GroupingPopover from 'components/GroupingPopover/GroupingPopover';

function Grouping({
  groupingSelectOptions,
  grouping,
  onGroupingSelectChange,
}: IGroupingProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box className='grouping_container__div'>
      <Box>Group selected metrics By:</Box>
      <Grid container spacing={1} justify='center' alignItems='center'>
        <Grid item>
          <GroupingItem
            title='Run Color Settings'
            advancedTitle='Color Advanced Options'
            groupName='color'
            groupPopover={
              <GroupingPopover
                groupName='color'
                selectOptions={groupingSelectOptions}
                selectedValues={grouping?.color}
                onSelect={onGroupingSelectChange}
                advancedComponent={
                  <ColorPopoverAdvanced
                    onPersistenceChange={() => null}
                    onPaletteChange={(e: any) => null}
                    selectedPersistence={1}
                  />
                }
              />
            }
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
            advancedTitle='stroke style advanced options'
            groupName='style'
            groupPopover={
              <GroupingPopover
                groupName='style'
                selectOptions={groupingSelectOptions}
                selectedValues={grouping?.style}
                onSelect={onGroupingSelectChange}
                advancedComponent={<StylePopoverAdvanced />}
              />
            }
            advancedPopover={<StylePopoverAdvanced />}
            onReset={() => null}
            onVisibilityChange={() => null}
          />
        </Grid>
        <Grid item>
          <GroupingItem
            title='Select fields to divide into charts'
            groupName='Chart'
            groupPopover={
              <GroupingPopover
                groupName='chart'
                selectOptions={groupingSelectOptions}
                selectedValues={grouping?.chart}
                onSelect={onGroupingSelectChange}
              />
            }
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
