import React from 'react';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IGroupingPopoverProps extends IBaseComponentProps {
  groupName: string;
  inputLabel?: string;
  advancedComponent?: React.FunctionComponentElement<React.ReactNode> | null;
}
