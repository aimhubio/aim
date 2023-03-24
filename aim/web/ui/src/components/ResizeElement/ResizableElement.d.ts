import * as React from 'react';

export interface ResizableElementProps
  extends React.HTMLAttributes<HTMLElement> {
  resizingFallback?: React.ReactNode;
  children: React.ReactNode | ((resizing: boolean) => React.ReactNode);
  hide?: boolean;
}
