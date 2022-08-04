import React from 'react';

export interface IBoxFullViewPopoverProps {
  onClose: () => void;
  element: React.FunctionComponentElement<React.ReactNode> | any;
  sequence: string;
  groupInfo: Record<any, any>;
}
