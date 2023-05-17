import React from 'react';

export interface IAppBarProps {
  title: string | ReactNode;
  className?: string;
  disabled?: boolean;
  children?: React.ReactChildren | any;
}
