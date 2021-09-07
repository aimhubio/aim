import React from 'react';
import './SearchBar.scss';
import searchImg from 'assets/icons/search.svg';
import { Divider, TextField } from '@material-ui/core';
import Button from 'components/Button/Button';
import SearchIcon from '@material-ui/icons/Search';
import runAppModel from 'services/models/runs/runsAppModel';

function SearchBar({
  isRunsDataLoading,
  searchValue,
  onSelectRunQueryChange,
}: any) {
  const searchRunsRef = React.useRef<any>(null);

  function handleRunSearch() {
    searchRunsRef.current = runAppModel.getRunsData();
    searchRunsRef.current.call();
  }

  return (
    <div className='Runs_Search_Bar'>
      <TextField
        className='Runs_Search_Bar__Input'
        placeholder='Runs'
        variant='outlined'
        size='small'
        InputProps={{
          startAdornment: (
            <img src={searchImg} alt='visible' style={{ marginRight: 10 }} />
          ),
          disabled: isRunsDataLoading,
        }}
        onChange={({ target }) => onSelectRunQueryChange(target.value)}
        value={searchValue || ''}
      />
      <Divider style={{ margin: '0 1em' }} orientation='vertical' flexItem />
      <Button
        className='Runs_Search_Bar__Button'
        color='primary'
        onClick={handleRunSearch}
        variant='contained'
        size='small'
        startIcon={<SearchIcon color='inherit' />}
        disabled={isRunsDataLoading}
      >
        Search
      </Button>
    </div>
  );
}

export default SearchBar;
