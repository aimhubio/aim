import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Skeleton } from '@material-ui/lab';
import './BusyLoaderWrapper.scss';

function BusyLoaderWrapper({
  isLoading = false,
  className = '',
  children,
  loaderType = 'spinner',
  loaderConfig = {},
  width = '100%',
  height = 'auto',
}: any): React.FunctionComponentElement<React.ReactNode> {
  function loaderRender() {
    switch (loaderType) {
      case 'skeleton': {
        return <Skeleton {...loaderConfig} />;
      }
      default: {
        return <CircularProgress {...loaderConfig} />;
      }
    }
  }

  return isLoading ? (
    <div className={`BusyLoaderWrapper ${className}`} style={{ width, height }}>
      {loaderRender()}
    </div>
  ) : (
    children
  );
}

export default React.memo(BusyLoaderWrapper);
