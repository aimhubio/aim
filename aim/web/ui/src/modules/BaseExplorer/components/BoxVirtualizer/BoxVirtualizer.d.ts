import React from 'react';

import { IWidgetComponentProps } from '../../types';

export interface IBoxVirtualizerProps<T> {
  data: Array<T>;
  itemsRenderer: (
    value: [boxId: string, boxItems: Array<T>],
    boxIndex: number,
  ) => React.ReactNode;
  widgetRenderer?: (props: IWidgetComponentProps) => React.ReactNode;
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

export interface IBoxVirtualizerGridWindow {
  top: number;
  left: number;
  width: number;
  height: number;
}
