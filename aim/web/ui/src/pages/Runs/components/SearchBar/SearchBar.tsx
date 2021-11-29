import React from 'react';

import SearchOutlined from '@material-ui/icons/SearchOutlined';
import { Divider } from '@material-ui/core';

import { Button } from 'components/kit';
import ExpressionAutoComplete from 'components/kit/ExpressionAutoComplete';

import useParamsSuggestions from 'hooks/projectData/useParamsSuggestions';

import projectsModel from 'services/models/projects/projectsModel';
import runAppModel from 'services/models/runs/runsAppModel';

import './SearchBar.scss';

function SearchBar({
  isRunsDataLoading,
  searchValue,
  onSearchInputChange,
}: any) {
  const searchRunsRef = React.useRef<any>(null);
  const paramsSuggestions = useParamsSuggestions();

  React.useEffect(() => {
    const paramsMetricsRequestRef = projectsModel.getProjectParams(['metric']);
    paramsMetricsRequestRef.call();
    return () => {
      searchRunsRef.current?.abort();
      paramsMetricsRequestRef?.abort();
    };
  }, []);

  function handleRunSearch(e: React.ChangeEvent<any>) {
    e.preventDefault();
    searchRunsRef.current = runAppModel.getRunsData(true);
    searchRunsRef.current.call().catch();
  }

  return (
    <div className='Runs_Search_Bar'>
      <form onSubmit={handleRunSearch}>
        <ExpressionAutoComplete
          onExpressionChange={onSearchInputChange}
          onSubmit={handleRunSearch}
          value={searchValue}
          options={paramsSuggestions}
          placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
        />
      </form>
      <Divider style={{ margin: '0 1em' }} orientation='vertical' flexItem />
      <Button
        className='Runs_Search_Bar__Button'
        color='primary'
        onClick={handleRunSearch}
        variant='contained'
        startIcon={<SearchOutlined color='inherit' />}
        disabled={isRunsDataLoading}
      >
        Search
      </Button>
    </div>
  );
}

export default SearchBar;
