import React, { ChangeEvent } from 'react';

import { FormControl, InputLabel, OutlinedInput } from '@material-ui/core';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ISearchInputProps } from '../types';

import EndAdornment from './EndAdornment';

import './SearchInput.scss';

function SearchInput({
  value,
  onInputClear,
  onInputChange,
  isValidInput,
  isDisabled,
}: ISearchInputProps) {
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    onInputChange(event.target.value);
  }

  return (
    <ErrorBoundary>
      <FormControl className='SearchInput'>
        <InputLabel htmlFor='search' variant='outlined' color='primary'>
          Filter texts
        </InputLabel>
        <OutlinedInput
          fullWidth
          type='text'
          id='search'
          name='search'
          label='Search for text'
          value={value}
          disabled={isDisabled}
          error={!isValidInput}
          autoComplete='off'
          onChange={onChange}
          endAdornment={
            <EndAdornment
              isDisabled={isDisabled}
              showSearchIcon={!value}
              onClickClearButton={onInputClear}
            />
          }
          style={{
            height: 28,
          }}
        />
      </FormControl>
    </ErrorBoundary>
  );
}

export default React.memo<ISearchInputProps>(SearchInput);
