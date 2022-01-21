import React, { ChangeEvent } from 'react';

import { FormControl, InputLabel, OutlinedInput } from '@material-ui/core';

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
  return (
    <FormControl className='SearchInput'>
      <InputLabel htmlFor='search' variant='outlined' color='primary'>
        Search for text
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
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onInputChange(event.target.value)
        }
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
  );
}

export default React.memo<ISearchInputProps>(SearchInput);
