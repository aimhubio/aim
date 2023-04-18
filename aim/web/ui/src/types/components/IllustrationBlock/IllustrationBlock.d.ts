import React from 'react';

import { IllustrationsEnum } from 'config/illustrationConfig/illustrationConfig';

export interface IIllustrationBlockProps {
  title?: string | React.ReactNode;
  content?: string | React.ReactNode;
  image?: React.FunctionComponentElement<React.ReactNode> | HTMLImageElement;
  className?: string;
  page?:
    | 'runs'
    | 'metrics'
    | 'params'
    | 'image'
    | 'audio'
    | 'scatters'
    | 'figures'
    | 'bookmarks'
    | 'tags';
  type?: IllustrationsEnum;
  size?: 'small' | 'medium' | 'large' | 'xLarge';
  showImage?: boolean;
}
