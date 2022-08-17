import React from 'react';

import { AimFlatObjectBase } from 'modules/BaseExplorerCore/pipeline/adapter/processor';

export interface IBoxVirtualizerProps {
  data: Array<AimFlatObjectBase<any>>;
  itemsRenderer: (
    value: [groupKey: string, items: Array<AimFlatObjectBase<any>>],
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
