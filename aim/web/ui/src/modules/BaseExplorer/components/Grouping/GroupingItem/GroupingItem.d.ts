import React from 'react';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

import { IconName } from 'components/kit/Icon';

export interface IGroupingItemProps extends IBaseComponentProps {
  groupName: string;
  inputLabel?: string;
  title?: string;
  advancedComponent?: React.FunctionComponentElement<React.ReactNode> | null;
  iconName: IconName;
}
