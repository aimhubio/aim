import React from 'react';

export interface ICopyToClipBoardProps {
  contentRef: React.RefObject<any>;
  showSuccessDelay?: number;
  className?: string;
}
