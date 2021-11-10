import React from 'react';

import GroupingPopovers from 'config/grouping/GroupingPopovers';

import { IGroupingProps } from 'types/pages/components/Grouping/Grouping';
import { GroupNameType } from 'types/services/models/metrics/metricsAppModel';

import GroupingItem from '../GroupingItem/GroupingItem';

import './Grouping.scss';

function Grouping({
  groupingData,
  groupingSelectOptions,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingPersistenceChange,
  onGroupingApplyChange,
  onShuffleChange,
  groupingPopovers = GroupingPopovers,
}: IGroupingProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='Grouping'>
      {groupingPopovers.map(
        ({ title, advancedTitle, groupName, AdvancedComponent }) => {
          return (
            <GroupingItem
              key={groupName}
              title={title}
              advancedTitle={advancedTitle}
              groupName={groupName as GroupNameType}
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
