import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Box, ControlsButton, Popover, Text } from 'components/kit_v2';

import { PipelineStatusEnum } from 'modules/core/engine/types';

import { GroupingPopover } from '../GroupingPopover';

import { IGroupingItemProps } from './';

function GroupingItem({
  groupName,
  inputLabel,
  title,
  ...props
}: IGroupingItemProps): React.FunctionComponentElement<React.ReactNode> {
  const {
    engine: { useStore, pipeline, groupings },
  } = props;

  const currentValues = useStore(groupings.currentValuesSelector);
  const isDisabled =
    useStore(pipeline.statusSelector) === PipelineStatusEnum.Executing;

  const hasAppliedValues = React.useMemo(() => {
    return currentValues[groupName]?.fields.length > 0;
  }, [currentValues, groupName]);

  return (
    <ErrorBoundary>
      <Popover
        title={
          <Box display='flex' ai='center' jc='space-between'>
            <Text>{title ?? `Group by ${groupName}`}</Text>
          </Box>
        }
        popperProps={{ css: { padding: '0', width: '24rem' }, align: 'start' }}
        content={
          <GroupingPopover
            groupName={groupName}
            inputLabel={inputLabel}
            {...props}
          />
        }
        trigger={({ open }) => (
          <ControlsButton
            hasAppliedValues={hasAppliedValues}
            disabled={isDisabled}
            open={open}
          >
            {_.capitalize(groupName)}
          </ControlsButton>
        )}
      />
    </ErrorBoundary>
  );
}

GroupingItem.displayName = 'GroupingItem';
export default React.memo<IGroupingItemProps>(GroupingItem);
