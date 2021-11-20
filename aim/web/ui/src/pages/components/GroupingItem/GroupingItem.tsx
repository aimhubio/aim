import React from 'react';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import GroupingPopover from 'components/GroupingPopover/GroupingPopover';
import { Icon, Text } from 'components/kit';
import { IconName } from 'components/kit/Icon';

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

    //   <Box mt={0.75} display='flex' justifyContent='space-between'>
    //     <ControlPopover
    //       title={advancedTitle}
    //       anchor={({ onAnchorClick }) => (
    //         <div className='GroupingItem__button_small' onClick={onAnchorClick}>
    //           <More
    //             color='primary'
    //             style={{ width: 10, height: 10, padding: 0, margin: 0 }}
    //           />
    //         </div>
    //       )}
    //       component={advancedComponent}
    //     />
    //     <div
    //       className='GroupingItem__button_small'
    //       onClick={onVisibilityChange}
    //     >
    //       {groupingData?.isApplied[groupName] ? (
    //         <Visibility
    //           className='GroupingItem__button__icon'
    //           color='primary'
    //         />
    //       ) : (
    //         <VisibilityOff
    //           className='GroupingItem__button__icon'
    //           color='secondary'
    //         />
    //       )}
    //     </div>
    //     <div className='GroupingItem__button_small' onClick={onReset}>
    //       X
    //     </div>
    //   </Box>
    // </div>
  );
}

export default GroupingItem;
