import React from 'react';
import { Skeleton } from '@material-ui/lab';

import './ChartLoader.scss';

function ChartLoader(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='ChartLoader'>
      <div className='ChartLoader__chart'>
        <span>Loading...</span>
      </div>
      <div className='ChartLoader__controls'>
        <Skeleton variant='rect' width='35px' height='35px' animation='wave' />
        <Skeleton variant='rect' width='35px' height='35px' animation='wave' />
        <Skeleton variant='rect' width='35px' height='35px' animation='wave' />
        <Skeleton variant='rect' width='35px' height='35px' animation='wave' />
        <Skeleton variant='rect' width='35px' height='35px' animation='wave' />
        <Skeleton variant='rect' width='35px' height='35px' animation='wave' />
        <Skeleton variant='rect' width='35px' height='35px' animation='wave' />
      </div>
    </div>
  );
}

export default ChartLoader;
