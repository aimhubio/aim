import React from 'react';

import { PopoverProps } from '@material-ui/core';

export default interface IControlPopoverProps extends Partial<PopoverProps> {
  anchor: (params: {
    onAnchorClick: (event: React.MouseEvent<HTMLElement>) => void;
    opened?: boolean;
  }) => React.FunctionComponentElement<React.ReactNode> | HTMLElement | null;
  component:
    | ((params: {
        handleClose?: () => void;
        opened?: boolean;
      }) =>
        | React.FunctionComponentElement<React.ReactNode>
        | HTMLElement
        | null)
    | React.FunctionComponentElement<React.ReactNode>;
  title?: string;
  titleClassName?: string;
  open?: boolean;
}
