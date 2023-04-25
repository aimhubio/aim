import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Text, Icon, ToggleButton } from 'components/kit';

import { PipelineStatusEnum } from 'modules/core/engine/types';
import { GroupType } from 'modules/core/pipeline';

import { GroupingPopover } from '../GroupingPopover';

import { IGroupingItemProps } from './';

import './GroupingItem.scss';

function GroupingItem({
  groupName,
  iconName = 'chart-group',
  inputLabel,
  advancedComponent,
  title,
  ...props
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  const {
    engine: { useStore, pipeline, groupings },
  } = props;
  const availableModifiers = useStore(pipeline.additionalDataSelector);
  const currentValues = useStore(groupings.currentValuesSelector);
  const isDisabled =
    useStore(pipeline.statusSelector) === PipelineStatusEnum.Executing;

  const onToggleApplyingGrouping = React.useCallback(
    (value) => {
      const isApplied = value === 'On';
      let groupingValues = {
        ...currentValues,
        [groupName]: {
          ...currentValues[groupName],
          isApplied,
        },
      };
      if (isApplied) {
        switch (groupName) {
          case GroupType.GRID: {
            groupingValues = {
              ...groupingValues,
              [GroupType.ROW]: {
                ...groupingValues[GroupType.ROW],
                isApplied: false,
              },
              [GroupType.COLUMN]: {
                ...groupingValues[GroupType.COLUMN],
                isApplied: false,
              },
            };
            break;
          }
          case GroupType.ROW:
          case GroupType.COLUMN: {
            groupingValues = {
              ...groupingValues,
              [GroupType.GRID]: {
                ...groupingValues[GroupType.GRID],
                isApplied: false,
              },
            };
            break;
          }
        }
      }
      groupings.update(groupingValues);
      pipeline.group(groupingValues);
    },
    [currentValues, groupName, groupings, pipeline],
  );

  return (
    <ErrorBoundary>
      <ControlPopover
        title={title ?? `Group by ${groupName}`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title={`Group by ${groupName}`}>
            <>
              <Button
                size='xSmall'
                disabled={isDisabled}
                onClick={onAnchorClick}
                className={classNames('BaseGroupingItem', {
                  active: opened,
                  outlined:
                    !_.isNil(availableModifiers) &&
                    !_.isEmpty(currentValues[groupName].fields),
                })}
              >
                <Text
                  size={12}
                  weight={600}
                  className='BaseGroupingItem__label'
                >
                  {groupName}
                </Text>
                <Icon
                  name='arrow-down-contained'
                  className={classNames('BaseGroupingItem__arrowIcon', {
                    opened,
                  })}
                  fontSize={6}
                />
              </Button>
              {groupings[groupName].settings.facet && (
                <ToggleButton
                  title='Toggle grouping'
                  id='disable-grouping'
                  value={currentValues[groupName].isApplied ? 'On' : 'Off'}
                  leftLabel='Off'
                  rightLabel='On'
                  leftValue='Off'
                  rightValue='On'
                  onChange={onToggleApplyingGrouping}
                />
              )}
            </>
          </Tooltip>
        )}
        component={
          <GroupingPopover
            groupName={groupName}
            inputLabel={inputLabel}
            advancedComponent={advancedComponent}
            {...props}
          />
        }
      />
    </ErrorBoundary>
  );
}

GroupingItem.displayName = 'GroupingItem';

export default React.memo<IGroupingItemProps>(GroupingItem);
