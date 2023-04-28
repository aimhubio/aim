import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary';
import { FormGroup } from 'components/kit_v2';

import useGroupingPopover from './useGroupingPopover';

import { IGroupingPopoverProps } from './';

/**
 * @description The GroupingPopover component is a wrapper for the FormGroup component.
 * @param props IGroupingPopoverProps - The props data for the component.
 * @returns React.FunctionComponentElement<React.ReactNode>
 */
function GroupingPopover(
  props: IGroupingPopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
  const formGroupData = useGroupingPopover(props);
  return (
    <ErrorBoundary>
      <FormGroup data={formGroupData} />
    </ErrorBoundary>
  );
}

GroupingPopover.displayName = 'GroupingPopover';
export default GroupingPopover;
