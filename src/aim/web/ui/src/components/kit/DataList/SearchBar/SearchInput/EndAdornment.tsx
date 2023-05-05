import React from 'react';

import Icon from 'components/kit/Icon';
import Button from 'components/kit/Button';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ISearchInputEndAdornment } from '../types';

function EndAdornment({
  showSearchIcon = true,
  onClickClearButton,
  isDisabled,
}: ISearchInputEndAdornment) {
  return (
    <ErrorBoundary>
      <span className='EndAdornment'>
        {showSearchIcon ? (
          <Icon name='search' fontSize={14} />
        ) : (
          <>
            <span className='divider-vertical' />
            <Button
              withOnlyIcon
              size='xxSmall'
              onClick={onClickClearButton}
              color='secondary'
              disabled={isDisabled}
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
