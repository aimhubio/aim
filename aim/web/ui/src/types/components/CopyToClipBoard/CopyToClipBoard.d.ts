import { IButtonProps } from 'components/kit';
import React from 'react';

export interface ICopyToClipBoardProps {
  contentRef?: React.RefObject<any>;
  showSuccessDelay?: number;
  className?: string;
  copyContent?: string | null;
  iconSize?: IButtonProps['size'];
}
