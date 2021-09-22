import React from 'react';

export interface IAppBarProps {
  title: string | ReactNode;
  className?: string;
  children?: React.ReactChildren | any;
}
