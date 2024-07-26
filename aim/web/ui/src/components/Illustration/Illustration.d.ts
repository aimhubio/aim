import * as React from 'react';

import { PipelineStatusEnum } from 'modules/core/engine/types';

export interface IIllustrationProps {
  content?: string | React.ReactNode;
  image?: React.FunctionComponentElement<React.ReactNode> | HTMLImageElement;
  type?: IllustrationType;
  className?: string;
  size?: IllustrationSizeType;
  showImage?: boolean;
  children?: React.ReactNode;
}

export type IllustrationSizeType = 'small' | 'medium' | 'large' | 'xLarge';

export type IllustrationType = string | PipelineStatusEnum;
