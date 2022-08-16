import React from 'react';

export interface IBoxVirtualizerProps<T> {
  data: Array<T>;
  itemsRenderer: (value: [groupId: string, items: Array<T>]) => React.ReactNode;
}
