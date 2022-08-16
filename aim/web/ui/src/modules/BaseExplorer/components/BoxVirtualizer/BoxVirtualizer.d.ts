import React from 'react';

export interface IBoxVirtualizerProps<T> {
  data: Array<T>;
  itemsRenderer: (
    value: [groupKey: string, items: Array<T>],
  ) => React.ReactNode;
}
