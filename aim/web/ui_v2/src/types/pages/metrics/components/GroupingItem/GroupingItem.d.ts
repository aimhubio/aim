import React from 'react';

export interface IGroupingItemProps {
  groupName: string;
  onReset: () => void;
  onVisibilityChange: () => void;
  groupPopover: React.FunctionComponentElement<React.ReactNode>;
  advancedPopover: React.FunctionComponentElement<React.ReactNode>;
  title: string;
  advancedTitle?: string;
}
