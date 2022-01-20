import React from 'react';

import { Tooltip } from '@material-ui/core';

import Icon from 'components/kit/Icon';
import Button from 'components/kit/Button';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import {
  ISearchBarProps,
  MatchTypes,
} from 'pages/RunDetail/TextsVisualizer/SearchBar/types.d';

import SearchInput from './SearchInput';

import './SearchBar.scss';

function SearchBar({
  matchType,
  searchValue,
  isValidInput,
  onInputClear,
  onInputChange,
  onMatchTypeChange,
}: ISearchBarProps) {
  return (
    <ErrorBoundary>
      <div className='SearchBar'>
        <SearchInput
          value={searchValue}
          onInputClear={onInputClear}
          onInputChange={onInputChange}
          isValidInput={isValidInput}
        />
        <div className='MatchIcons'>
          <Tooltip title='Match Case'>
            <div className='MatchButton'>
              <Button
                withOnlyIcon
                color={matchType === MatchTypes.Case ? 'primary' : 'secondary'}
                size='small'
                onClick={() => {
                  onMatchTypeChange(
                    matchType === MatchTypes.Case ? null : MatchTypes.Case,
                  );
                }}
              >
                <Icon className='IconButton' name='case-sensitive' />
              </Button>
            </div>
          </Tooltip>
          <Tooltip title='Match Word'>
            <div className='MatchButton'>
              <Button
                withOnlyIcon
                color={matchType === MatchTypes.Word ? 'primary' : 'secondary'}
                size='small'
                onClick={() => {
                  onMatchTypeChange(
                    matchType === MatchTypes.Word ? null : MatchTypes.Word,
                  );
                }}
              >
                <Icon className='IconButton' name='word-match' />
              </Button>
            </div>
          </Tooltip>
          <Tooltip title='Match Regexp'>
            <div className='MatchButton'>
              <Button
                withOnlyIcon
                color={
                  matchType === MatchTypes.RegExp ? 'primary' : 'secondary'
                }
                size='small'
                onClick={() => {
                  onMatchTypeChange(
                    matchType === MatchTypes.RegExp ? null : MatchTypes.RegExp,
                  );
                }}
              >
                <Icon className='IconButton' name='regex' />
              </Button>
            </div>
          </Tooltip>
        </div>
      </div>
    </ErrorBoundary>
  );
}

SearchBar.displayName = 'SearchBar';

export default React.memo<ISearchBarProps>(SearchBar);
