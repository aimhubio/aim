import React from 'react';
import { Box, Grid } from '@material-ui/core';

import GroupingItem from '../GroupingItem/GroupingItem';
import StylePopoverAdvanced from 'pages/Metrics/components/StylePopoverAdvanced/StylePopoverAdvanced';
import ColorPopoverAdvanced from 'pages/Metrics/components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import { groupNames } from 'types/services/models/metrics/metricsAppModel';
import { IGroupingProps } from 'types/pages/metrics/components/Grouping/Grouping';

import './groupingStyle.scss';

const groupingPopovers = [
  {
    title: 'Run Color Settings',
    advancedTitle: 'Color Advanced Options',
    groupName: 'color',
    AdvancedComponent: ColorPopoverAdvanced,
  },
  {
    title: 'Select Fields For Grouping by stroke style',
    advancedTitle: 'stroke style advanced options',
    groupName: 'style',
    AdvancedComponent: StylePopoverAdvanced,
  },
  {
    title: 'Select fields to divide into charts',
    groupName: 'chart',
    AdvancedComponent: null,
  },
];

function Grouping({
  groupingData,
  groupingSelectOptions,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
}: IGroupingProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Box className='grouping_container__div'>
      <Box>Group selected metrics By:</Box>
      <Grid container spacing={1} justify='center' alignItems='center'>
        {groupingPopovers.map(
          ({ title, advancedTitle, groupName, AdvancedComponent }) => {
            return (
              <Grid key={groupName} item>
                <GroupingItem
                  title={title}
                  advancedTitle={advancedTitle}
                  groupName={groupName}
                  selectOptions={groupingSelectOptions}
                  groupingData={groupingData}
                  onSelect={onGroupingSelectChange}
                  onGroupingModeChange={onGroupingModeChange}
                  advancedComponent={
                    AdvancedComponent && (
                      <AdvancedComponent
                        onPersistenceChange={() => null}
                        persistence={1}
                        {...(groupName === 'color' && {
                          onGroupingPaletteChange,
                          paletteIndex: groupingData?.paletteIndex,
                        })}
                      />
                    )
                  }
                  onReset={() => null}
                  onVisibilityChange={() => null}
                />
              </Grid>
            );
          },
        )}
      </Grid>
    </Box>
  );
}

export default React.memo(Grouping);
