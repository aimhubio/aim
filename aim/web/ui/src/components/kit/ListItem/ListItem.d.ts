import React from 'react';

export interface IListItemProps
  extends Partial<React.ReactHTMLElement<HTMLDivElement>> {
  className?: string;
  children?: React.ReactNode;
  size?: IListITemSize;
}

export type IListITemSize = 'small' | 'medium' | 'large';
