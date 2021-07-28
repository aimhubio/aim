import React from 'react';

export interface IGroupingItemProps {
  groupName: string;
  onReset: () => void;
  onVisibilityChange: () => void;
  groupPopup: React.FunctionComponentElement<React.ReactNode>;
  advancedPopup: React.FunctionComponentElement<React.ReactNode>;
}
