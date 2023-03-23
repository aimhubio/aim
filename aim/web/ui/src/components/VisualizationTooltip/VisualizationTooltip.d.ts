import React from 'react';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

export interface IVisualizationTooltipProps {
  id?: string;
  children?: React.ReactNode;
  elementRect: ElementRect;
  open: boolean;
  forceOpen?: boolean;
  className?: string;
  containerNode?: HTMLElement | null;
  tooltipAppearance?: TooltipAppearanceEnum;
}

export type ElementRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
} | null;
