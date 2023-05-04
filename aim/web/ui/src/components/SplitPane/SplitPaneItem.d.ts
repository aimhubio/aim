import * as React from 'react';

export interface SplitPaneItemProps extends React.HTMLAttributes<HTMLElement> {
  resizingFallback?: React.ReactNode;
  children: React.ReactNode | ((resizing: boolean) => React.ReactNode);
  hide?: boolean;
}
