import React from 'react';

import { Button, Icon } from 'components/kit';

import { ISearchButtonProps } from './SearchButton.d';

function SearchButton({ isFetching, onSubmit, ...rest }: ISearchButtonProps) {
  return (
    <Button
      key={`${isFetching}`}
      color='primary'
      variant={isFetching ? 'outlined' : 'contained'}
      startIcon={
        <Icon
          name={isFetching ? 'close' : 'search'}
          fontSize={isFetching ? 12 : 14}
        />
      }
      className='QueryForm__search__button'
      onClick={onSubmit}
      {...rest}
    >
      {isFetching ? 'Cancel' : 'Search'}
    </Button>
  );
}

export default React.memo(SearchButton);
