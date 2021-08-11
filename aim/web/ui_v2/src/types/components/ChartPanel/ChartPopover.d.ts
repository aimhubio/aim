import React from 'react';
import { PopoverPosition } from '@material-ui/core';

export interface IChartPopover {
  children?: React.ReactNode;
  popoverPosition: PopoverPosition | null;
  open: boolean;
  className?: string;
  id?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}
