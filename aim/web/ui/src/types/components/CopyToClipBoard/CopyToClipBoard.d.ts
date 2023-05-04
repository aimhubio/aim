import React from 'react';

import { IIconButtonProps } from 'components/kit_v2/IconButton';

export interface ICopyToClipBoardProps {
  contentRef?: React.RefObject<any>;
  showSuccessDelay?: number;
  className?: string;
  copyContent?: string | null;
  iconSize?: IIconButtonProps['size'];
}
