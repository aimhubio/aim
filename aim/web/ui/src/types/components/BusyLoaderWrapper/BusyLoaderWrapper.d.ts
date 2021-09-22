import React from 'react';

export interface IBusyLoaderWrapperProps {
  isLoading: boolean;
  className?: string;
  children?: React.ReactElement | any;
  loaderComponent?: React.ReactElement;
  loaderType?: string;
  loaderConfig?: object;
  width?: string;
  height?: string;
}
