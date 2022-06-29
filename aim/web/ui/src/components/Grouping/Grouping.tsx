import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Text } from 'components/kit';

import GroupingPopovers, {
  GroupNameEnum,
} from 'config/grouping/GroupingPopovers';

import { IGroupingProps } from 'types/pages/components/Grouping/Grouping';

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
  isDisabled = false,
}: IGroupingProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <div className='Grouping'>
        <div className='Grouping__title'>
          <Text size={12} weight={600}>
            Group by
          </Text>
        </div>
        <div className='Grouping__content'>
          {groupingPopovers.map(
            ({ title, inputLabel, groupName, AdvancedComponent }) => {
              return (
                <GroupingItem
                  key={groupName}
                  title={title}
                  inputLabel={inputLabel}
                  groupName={groupName as GroupNameEnum}
                  groupingData={groupingData}
                  groupingSelectOptions={groupingSelectOptions}
                  onSelect={onGroupingSelectChange}
                  onGroupingModeChange={onGroupingModeChange}
                  isDisabled={isDisabled}
                  advancedComponent={
                    AdvancedComponent && (
                      <AdvancedComponent
                        groupingData={groupingData}
                        onPersistenceChange={onGroupingPersistenceChange}
                        persistence={
                          groupingData?.persistence[
                            groupName as 'color' | 'stroke'
                          ]
                        }
                        onShuffleChange={onShuffleChange}
                        {...(groupName === GroupNameEnum.COLOR && {
                          onGroupingPaletteChange,
                          paletteIndex: groupingData?.paletteIndex,
                        })}
                      />
                    )
                  }
                  onReset={() => onGroupingReset(groupName as GroupNameEnum)}
                  onVisibilityChange={() =>
                    onGroupingApplyChange(groupName as GroupNameEnum)
                  }
                />
              );
            },
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(Grouping);
