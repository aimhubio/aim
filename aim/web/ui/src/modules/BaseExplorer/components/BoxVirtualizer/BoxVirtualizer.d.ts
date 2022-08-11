import React from 'react';

import { AimFlatObjectBase } from 'modules/BaseExplorerCore/pipeline/adapter/processor';

export interface IBoxVirtualizerProps {
  data: Array<AimFlatObjectBase<any>>;
  itemsRenderer: (
    items: Array<AimFlatObjectBase<any>>,
    groupKey: string,
  ) => React.ReactNode;
}
