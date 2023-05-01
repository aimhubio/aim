import React from 'react';

import { Skeleton } from '@material-ui/lab';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { Spinner } from 'components/kit';

import { IBusyLoaderWrapperProps } from 'types/components/BusyLoaderWrapper/BusyLoaderWrapper';

import './BusyLoaderWrapper.scss';

function BusyLoaderWrapper({
  isLoading = false,
  className = '',
  children,
  loaderType = 'spinner',
  loaderConfig = {},
  width = '100%',
  height = 'auto',
  loaderComponent,
}: IBusyLoaderWrapperProps): React.FunctionComponentElement<React.ReactNode> | null {
  function loaderRender(): React.ReactElement {
    switch (loaderType) {
      case 'skeleton': {
        return <Skeleton {...loaderConfig} />;
      }
      default: {
        return <Spinner {...loaderConfig} />;
      }
    }
  }
  return (
    <>
      {isLoading ? (
        <ErrorBoundary>
          <div
            className={`BusyLoaderWrapper ${className}`}
            style={{ width, height }}
          >
            {loaderComponent || loaderRender()}
          </div>
        </ErrorBoundary>
      ) : children ? (
        children
      ) : null}
    </>
  );
}

export default React.memo(BusyLoaderWrapper);
