import React from 'react';

export interface IEmptyComponentProps {
  title?: string;
  content?: string;
  img?: React.FunctionComponentElement<React.ReactNode> | HTMLImageElement;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'xLarge';
  imageName?: 'emptyBookmarks' | 'emptySearch' | 'exploreData' | 'wrongSearch';
}
