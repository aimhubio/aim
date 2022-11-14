import * as React from 'react';

export interface SplitPaneItemProps extends React.HTMLAttributes<HTMLElement> {
  index: number;
  resizingFallback?: React.ReactNode;
  children: React.ReactNode | ((resizing: boolean) => React.ReactNode);
}
