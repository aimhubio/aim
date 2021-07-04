import React from 'react';

export default interface IPopupProps {
  anchor: (params: {
    handleClick: (event: React.MouseEvent<HTMLElement>) => void;
    open?: boolean;
  }) => React.FunctionComponentElement<React.ReactNode> | HTMLElement | null;
  component: React.FunctionComponentElement<React.ReactNode>;
}
