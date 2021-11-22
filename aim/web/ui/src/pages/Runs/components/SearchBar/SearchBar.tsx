import React from 'react';

import { Divider, TextField } from '@material-ui/core';

import searchImg from 'assets/icons/search.svg';

import { Button, Icon } from 'components/kit';

import runAppModel from 'services/models/runs/runsAppModel';

import './SearchBar.scss';

function SearchBar({
  isRunsDataLoading,
  searchValue,
  onSearchInputChange,
}: any) {
  const searchRunsRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      searchRunsRef.current?.abort();
    };
  }, []);

  function handleRunSearch(e: React.ChangeEvent<any>) {
    e.preventDefault();
    if (isRunsDataLoading) {
      return;
    }
    searchRunsRef.current = runAppModel.getRunsData(true);
    searchRunsRef.current.call().catch();
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!isRunsDataLoading) {
      return;
    }
    searchRunsRef.current?.abort();
    runAppModel.abortRequest();
  }

  return (
    <div className='Runs_Search_Bar'>
      <form onSubmit={handleRunSearch}>
        <TextField
          fullWidth
          size='small'
          placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.creation_time >= 1632081600'
          variant='outlined'
          spellCheck={false}
          InputProps={{
            startAdornment: (
              <img src={searchImg} alt='visible' style={{ marginRight: 10 }} />
            ),
            style: { height: '1.845rem' },
          }}
          onChange={({ target }) => onSearchInputChange(target.value)}
          value={searchValue || ''}
        />
      </form>
      <Divider style={{ margin: '0 1em' }} orientation='vertical' flexItem />
      <Button
        className='Runs_Search_Bar__Button'
        color='primary'
        onClick={isRunsDataLoading ? handleRequestAbort : handleRunSearch}
        variant='contained'
        startIcon={
          <Icon
            name={isRunsDataLoading ? 'close' : 'search'}
            fontSize={isRunsDataLoading ? 10 : 14}
          />
        }
      >
        {isRunsDataLoading ? 'Cancel' : 'Search'}
      </Button>
    </div>
  );
}

export default SearchBar;
