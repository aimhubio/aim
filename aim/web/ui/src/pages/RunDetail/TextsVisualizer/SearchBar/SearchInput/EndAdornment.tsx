import React from 'react';

import Icon from 'components/kit/Icon';
import Button from 'components/kit/Button';

interface IEndAdornment {
  showSearchIcon?: boolean;
}

function EndAdornment({ showSearchIcon = true }: IEndAdornment) {
  return (
    <span className='EndAdornment'>
      {showSearchIcon ? (
        <Icon name='search' />
      ) : (
        <>
          <span className='divider-vertical' />
          <Button
            withOnlyIcon
            size='small'
            onClick={() => {
              console.log('clear');
            }}
            color='secondary'
          >
            <Icon name='close' />
          </Button>
        </>
      )}
    </span>
  );
}

export default EndAdornment;
