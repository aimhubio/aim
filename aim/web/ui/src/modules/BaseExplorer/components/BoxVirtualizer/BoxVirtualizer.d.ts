import React from 'react';

export interface IBoxVirtualizerProps<T> {
  data: Array<T>;
  itemsRenderer: (
    value: [boxId: string, boxItems: Array<T>],
    boxIndex: number,
  ) => React.ReactNode;
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
