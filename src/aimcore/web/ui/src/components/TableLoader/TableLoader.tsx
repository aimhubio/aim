import React from 'react';

import { Skeleton } from '@material-ui/lab';

import './TableLoader.scss';

function TableLoader(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='TableLoader__container'>
      <div className='TableLoader__raw'>
        <Skeleton width='10%' />
        <Skeleton width='25%' />
        <Skeleton width='10%' />
        <Skeleton width='10%' />
      </div>
      <div className='TableLoader__raw'>
        <Skeleton width='5%' />
        <Skeleton width='10%' />
        <Skeleton width='5%' />
        <Skeleton width='15%' />
        <Skeleton width='10%' />
        <Skeleton width='20%' />
        <Skeleton width='5%' />
        <Skeleton width='10%' />
      </div>
      <div className='TableLoader__raw'>
        <Skeleton width='10%' />
        <Skeleton width='5%' />
        <Skeleton width='5%' />
        <Skeleton width='15%' />
        <Skeleton width='10%' />
        <Skeleton width='5%' />
        <Skeleton width='10%' />
        <Skeleton width='20%' />
      </div>
      <div className='TableLoader__raw'>
        <Skeleton width='15%' />
        <Skeleton width='5%' />
        <Skeleton width='20%' />
        <Skeleton width='5%' />
        <Skeleton width='10%' />
        <Skeleton width='10%' />
        <Skeleton width='10%' />
        <Skeleton width='5%' />
      </div>
      <div className='TableLoader__raw'>
        <Skeleton width='20%' />
        <Skeleton width='10%' />
        <Skeleton width='5%' />
        <Skeleton width='5%' />
        <Skeleton width='10%' />
        <Skeleton width='5%' />
        <Skeleton width='10%' />
        <Skeleton width='15%' />
      </div>
    </div>
  );
}

export default React.memo(TableLoader);
