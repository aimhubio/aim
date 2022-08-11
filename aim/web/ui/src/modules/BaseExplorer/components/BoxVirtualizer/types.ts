import React, { ReactChildren } from 'react';

export interface BoxVirtualizerProps {
  data: any;
  itemRenderer: (item: any, i: number) => React.ReactNode;
  children?: ReactChildren;
  axisData?: {
    column?: any;
    row?: any;
  };
  axisItemRenderer?: {
    column?: (item: any, i: number) => React.ReactNode;
    row?: (item: any, i: number) => React.ReactNode;
  };
}
