import React from 'react';

import { FormControl, InputLabel, OutlinedInput } from '@material-ui/core';

import EndAdornment from './EndAdornment';

import './SearchInput.scss';

interface ISearchInputProps {
  value: string;
}
function SearchInput(props: ISearchInputProps) {
  return (
    <FormControl className='SearchInput'>
      <InputLabel htmlFor='search' variant='outlined' color='primary'>
        Search for text
      </InputLabel>
      <OutlinedInput
        autoFocus
        id='search'
        name='search'
        type='text'
        label='Search for text'
        fullWidth
        value={props.value}
        endAdornment={<EndAdornment showSearchIcon={!props.value} />}
        style={{
          height: 28,
        }}
        inputProps={{
          style: {
            height: 28,
          },
        }}
      />
    </FormControl>
  );
}

export default SearchInput;
