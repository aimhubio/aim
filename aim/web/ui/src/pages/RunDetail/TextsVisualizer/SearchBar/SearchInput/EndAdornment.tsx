import React from 'react';

import Icon from 'components/kit/Icon';
import Button from 'components/kit/Button';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ISearchInputEndAdornment } from '../types';

function EndAdornment({
  showSearchIcon = true,
  onClickClearButton,
}: ISearchInputEndAdornment) {
  return (
    <ErrorBoundary>
      <span className='EndAdornment'>
        {showSearchIcon ? (
          <Icon name='search' />
        ) : (
          <>
            <span className='divider-vertical' />
            <Button
              withOnlyIcon
              size='small'
              onClick={onClickClearButton}
              color='secondary'
            >
              <Icon name='close' />
            </Button>
          </>
        )}
      </span>
    </ErrorBoundary>
  );
}

export default React.memo<ISearchInputEndAdornment>(EndAdornment);
