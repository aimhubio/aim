import React from 'react';

import { IButtonProps } from 'components/kit';

export interface ICopyToClipBoardProps {
  contentRef?: React.RefObject<any>;
  showSuccessDelay?: number;
  className?: string;
  copyContent?: string | null;
  iconSize?: IButtonProps['size'];
  isURL?: bool | null;
}
