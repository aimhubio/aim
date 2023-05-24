import React from 'react';

import { IconName } from 'components/kit/Icon';

import { IBaseComponentProps } from 'modules/BaseExplorer/types';

export interface IGroupingItemProps extends IBaseComponentProps {
  groupName: string;
  inputLabel?: string;
  title?: string;
  advancedComponent?: React.FunctionComponentElement<React.ReactNode> | null;
  iconName: IconName;
}
