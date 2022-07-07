import React from 'react';

export interface BoxVirtualizerProps {
  data: any;
  itemRenderer: (item: any, i: number) => React.ReactNode;
}
