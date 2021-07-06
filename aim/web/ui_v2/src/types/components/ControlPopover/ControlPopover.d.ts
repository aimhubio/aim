import React from 'react';

export default interface IControlPopoverProps {
  anchor: (params: {
    onAnchorClick: (event: React.MouseEvent<HTMLElement>) => void;
    opened?: boolean;
  }) => React.FunctionComponentElement<React.ReactNode> | HTMLElement | null;
  component: React.FunctionComponentElement<React.ReactNode>;
}
