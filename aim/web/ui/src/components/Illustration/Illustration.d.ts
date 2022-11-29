import * as React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine/types';

export interface IIllustrationProps {
  content?: string | React.ReactNode;
  image?: React.FunctionComponentElement<React.ReactNode> | HTMLImageElement;
  type?: IllustrationType;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'xLarge';
  showImage?: boolean;
}

export type IllustrationType = string | PipelineStatusEnum;
