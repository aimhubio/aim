import React from 'react';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import { IGroupInfo } from '../../types';

export interface IBoxFullViewPopoverProps {
  onClose: () => void;
  item: AimFlatObjectBase;
  children: React.ReactNode;
  sequenceType: string;
  itemGroupInfo: Record<string, IGroupInfo>;
}
