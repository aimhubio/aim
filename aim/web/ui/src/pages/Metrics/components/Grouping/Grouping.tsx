import React from 'react';

import StrokePopoverAdvanced from 'pages/Metrics/components/StrokePopover/StrokePopoverAdvanced';
import ColorPopoverAdvanced from 'pages/Metrics/components/ColorPopoverAdvanced/ColorPopoverAdvanced';

import { IGroupingProps } from 'types/pages/metrics/components/Grouping/Grouping';
import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';

import GroupingItem from '../GroupingItem/GroupingItem';

import './Grouping.scss';

const groupingPopovers = (singleGrouping: boolean) =>
  singleGrouping
    ? [
        {
          title: 'Select Fields For Grouping',
          advancedTitle: 'Color Advanced Options',
          groupName: 'group',
          groupDisplayName: 'group',
          AdvancedComponent: null,
        },
      ]
    : [
        {
          title: 'Run Color Settings',
          advancedTitle: 'Color Advanced Options',
          groupName: 'color',
          groupDisplayName: 'color',
          AdvancedComponent: ColorPopoverAdvanced,
        },
        {
          title: 'Select Fields For Grouping by stroke style',
          advancedTitle: 'stroke style advanced options',
          groupName: 'stroke',
          groupDisplayName: 'stroke',
          AdvancedComponent: StrokePopoverAdvanced,
        },
        {
          title: 'Select fields to divide into charts',
          groupName: 'chart',
          groupDisplayName: 'chart',
          AdvancedComponent: null,
        },
      ];

function Grouping({
  groupingData,
  groupingSelectOptions,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingPersistenceChange,
  onGroupingApplyChange,
  singleGrouping = false,
  onShuffleChange,
}: IGroupingProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Grouping'>
      {groupingPopovers(singleGrouping).map(
        ({
          title,
          advancedTitle,
          groupName,
          groupDisplayName,
          AdvancedComponent,
        }) => {
          return (
            <GroupingItem
              key={groupName}
              title={title}
              advancedTitle={advancedTitle}
              groupName={groupName as GroupNameType}
              groupDisplayName={groupDisplayName}
              groupingData={groupingData}
              groupingSelectOptions={groupingSelectOptions}
              onSelect={onGroupingSelectChange}
              onGroupingModeChange={onGroupingModeChange}
              advancedComponent={
                AdvancedComponent && (
                  <AdvancedComponent
                    groupingData={groupingData}
                    onPersistenceChange={onGroupingPersistenceChange}
                    persistence={
                      groupingData?.persistence[groupName as 'color' | 'stroke']
                    }
                    onShuffleChange={onShuffleChange}
                    {...(groupName === 'color' && {
                      onGroupingPaletteChange,
                      paletteIndex: groupingData?.paletteIndex,
                    })}
                  />
                )
              }
              onReset={() => onGroupingReset(groupName as GroupNameType)}
              onVisibilityChange={() =>
                onGroupingApplyChange(groupName as GroupNameType)
              }
            />
          );
        },
      )}
    </div>
  );
}

export default React.memo(Grouping);
