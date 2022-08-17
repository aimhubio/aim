import React from 'react';

export interface IBoxVirtualizerProps<T> {
  data: Array<T>;
  itemsRenderer: (value: [groupId: string, items: Array<T>]) => React.ReactNode;
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
