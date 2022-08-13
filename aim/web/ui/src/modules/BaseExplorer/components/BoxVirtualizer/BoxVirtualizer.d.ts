import React from 'react';

import { AimFlatObjectBase } from 'modules/BaseExplorerCore/pipeline/adapter/processor';

export interface IBoxVirtualizerProps {
  data: Array<AimFlatObjectBase<any>>;
  itemsRenderer: (
    value: [groupKey: string, items: Array<AimFlatObjectBase<any>>],
  ) => React.ReactNode;
}
