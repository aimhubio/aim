import React from 'react';
import { Box, Button } from '@material-ui/core';

import ControlPopover from 'components/ControlPopover/ControlPopover';
import { IGroupingItemProps } from 'types/pages/metrics/components/GroupingItem/GroupingItem';
import GroupingPopover from 'components/GroupingPopover/GroupingPopover';
import { More, Visibility, VisibilityOff } from '@material-ui/icons';

import styleIcon from 'assets/icons/style.svg';
import chartIcon from 'assets/icons/chart.svg';
import colorIcon from 'assets/icons/palette.svg';

import './groupingItemStyle.scss';

const icons = {
  style: styleIcon,
  chart: chartIcon,
  color: colorIcon,
};

function GroupingItem({
  title,
  groupName,
  groupingData,
  advancedTitle,
  advancedComponent,
  onSelect,
  onGroupingModeChange,
  onReset,
  onVisibilityChange,
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <ControlPopover
      title={title}
      anchor={({ onAnchorClick }) => (
        <div className='GroupingItem__container'>
          <div onClick={onAnchorClick} className='GroupingItem__icon__box'>
            <img src={icons[groupName]} alt={groupName} />
          </div>
          <span>{groupName}</span>
        </div>
      )}
      component={
        <GroupingPopover
          groupName={groupName}
          groupingData={groupingData}
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
