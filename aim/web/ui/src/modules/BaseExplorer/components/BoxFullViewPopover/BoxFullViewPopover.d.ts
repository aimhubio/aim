import React from 'react';

import { AimFlatObjectBase } from 'types/core/AimObjects';

export interface IBoxFullViewPopoverProps {
  onClose: () => void;
  item: AimFlatObjectBase;
  children: React.ReactNode;
  sequenceName: string;
  groupInfo: Record<any, any>;
}
