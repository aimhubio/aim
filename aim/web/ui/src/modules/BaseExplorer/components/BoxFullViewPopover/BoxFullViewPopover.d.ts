import React from 'react';

import { AimFlatObjectBase } from 'modules/BaseExplorerCore/pipeline/adapter/processor';

export interface IBoxFullViewPopoverProps {
  onClose: () => void;
  item: AimFlatObjectBase<any>;
  children: React.ReactNode;
  sequenceName: string;
  groupInfo: Record<any, any>;
}
