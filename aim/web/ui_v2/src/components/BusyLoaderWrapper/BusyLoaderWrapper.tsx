import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import './BusyLoaderWrapper.scss';

function BusyLoaderWrapper({
  isLoading,
  children,
}: any): React.FunctionComponentElement<React.ReactNode> {
  return isLoading ? (
    <div className='BusyLoaderWrapper'>
      <CircularProgress />
    </div>
  ) : (
    children
  );
}

export default React.memo(BusyLoaderWrapper);
