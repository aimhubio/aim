import React from 'react';

export interface IListItemProps extends React.ReactHTMLElement<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}
