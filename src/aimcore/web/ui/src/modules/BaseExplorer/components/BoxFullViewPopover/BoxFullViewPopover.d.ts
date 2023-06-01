import React from 'react';

import { AimFlatObjectBase } from 'types/core/AimObjects';
import { SequenceType } from 'types/core/enums';

import { IGroupInfo } from '../../types';

export interface IBoxFullViewPopoverProps {
  onClose: () => void;
  item: AimFlatObjectBase;
  children: React.ReactNode;
  sequenceType: SequenceType;
  itemGroupInfo: Record<string, IGroupInfo>;
}
