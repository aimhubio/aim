import React, { ReactChildren } from 'react';

export interface BoxVirtualizerProps {
  data: any;
  itemRenderer: (item: any, i: number) => React.ReactNode;
  offset: number;
  axisData?: {
    columns?: any;
    rows?: any;
  };
  axisItemRenderer?: {
    columns?: (item: any, i: number) => React.ReactNode;
    rows?: (item: any, i: number) => React.ReactNode;
  };
}
