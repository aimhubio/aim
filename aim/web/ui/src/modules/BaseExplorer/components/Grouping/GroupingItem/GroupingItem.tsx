import React from 'react';
import _ from 'lodash-es';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';
import { PipelineStatusEnum } from 'modules/core/engine';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import ControlPopover from 'components/ControlPopover/ControlPopover';
import { Button, Text, Icon } from 'components/kit';

import { GroupingPopover } from '../GroupingPopover';

import { IGroupingItemProps } from './GroupingItem.d';

import './GroupingItem.scss';

function GroupingItem({
  groupName,
  iconName = 'chart-group',
  inputLabel,
  advancedComponent,
  title,
  ...props
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  const { engine } = props;
  const availableModifiers = engine.useStore(engine.additionalDataSelector);
  const currentValues = engine.useStore(engine.groupings.currentValuesSelector);
  const isDisabled =
    engine.useStore(engine.pipelineStatusSelector) ===
    PipelineStatusEnum.Executing;

  return (
    <ErrorBoundary>
      <ControlPopover
        title={title ?? `Group by ${groupName}`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        anchor={({ onAnchorClick, opened }) => (
          <Tooltip title={`Group by ${groupName}`}>
            <Button
              size='small'
              disabled={isDisabled}
              onClick={onAnchorClick}
              className={classNames('BaseGroupingItem', {
                active: opened,
                outlined:
                  !_.isNil(availableModifiers) &&
                  !_.isEmpty(currentValues[groupName].fields),
              })}
            >
              <Text size={12} weight={500} className='BaseGroupingItem__label'>
                {groupName}
              </Text>
              <Icon
                name={opened ? 'arrow-up-contained' : 'arrow-down-contained'}
                fontSize={6}
              />
            </Button>
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

export default React.memo<IGroupingItemProps>(GroupingItem);
