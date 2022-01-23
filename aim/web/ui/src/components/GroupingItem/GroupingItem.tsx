import React from 'react';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import GroupingPopover from 'components/GroupingPopover/GroupingPopover';
import { Icon, Text } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IGroupingItemProps } from 'types/pages/components/GroupingItem/GroupingItem';

import './GroupingItem.scss';

const icons = {
  stroke: 'line-style',
  chart: 'chart-group',
  group: 'image-group',
  color: 'coloring',
};

function GroupingItem({
  title,
  groupName,
  groupingData,
  advancedTitle,
  advancedComponent,
  onSelect,
  onGroupingModeChange,
  groupingSelectOptions,
  onReset,
  onVisibilityChange,
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ErrorBoundary>
      <ControlPopover
        title={title}
        anchor={({ onAnchorClick, opened }) => (
          <div onClick={onAnchorClick} className={'GroupingItem'}>
            <div
              className={`GroupingItem__icon__box ${opened ? 'active' : ''} ${
                groupingData?.[groupName]?.length ? 'outlined' : ''
              }`}
            >
              <Icon name={icons[groupName] as IconName} />
            </div>
            <Text>{groupName}</Text>
          </div>
        )}
        component={
          <GroupingPopover
            groupName={groupName}
            groupingData={groupingData}
            groupingSelectOptions={groupingSelectOptions}
            advancedComponent={advancedComponent}
            onSelect={onSelect}
            onGroupingModeChange={onGroupingModeChange}
          />
        }
      />
    </ErrorBoundary>
  );
}

export default GroupingItem;
