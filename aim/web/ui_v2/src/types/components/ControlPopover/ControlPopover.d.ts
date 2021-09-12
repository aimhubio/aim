import React from 'react';
import { PopoverProps } from '@material-ui/core';

export default interface IControlPopoverProps extends Partial<PopoverProps> {
  anchor: (params: {
    onAnchorClick: (event: React.MouseEvent<HTMLElement>) => void;
    opened?: boolean;
  }) => React.FunctionComponentElement<React.ReactNode> | HTMLElement | null;
  component: React.FunctionComponentElement<React.ReactNode> | null;
  title?: string;
  open?: boolean;
}
