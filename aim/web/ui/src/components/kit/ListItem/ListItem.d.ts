import React from 'react';

export interface IListItemProps
  extends Partial<React.ReactHTMLElement<HTMLDivElement>> {
  className?: string;
  children?: React.ReactNode;
  size?: IListITemSize;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export type IListITemSize = 'small' | 'medium' | 'large';
