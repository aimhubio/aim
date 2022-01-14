import React from 'react';

import { Tooltip } from '@material-ui/core';

import Icon from 'components/kit/Icon';
import Button from 'components/kit/Button';

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
    <div className='SearchBar'>
      <SearchInput
        value={searchValue}
        onInputClear={onInputClear}
        onInputChange={onInputChange}
        isValidInput={isValidInput}
      />
      <div className='MatchIcons'>
        <Tooltip title='Match Case'>
          <div>
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
              <Icon name='case-sensitive' />
            </Button>
          </div>
        </Tooltip>
        <Tooltip title='Match Word'>
          <div>
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
              <Icon name='word-match' />
            </Button>
          </div>
        </Tooltip>
        <Tooltip title='Match Regexp'>
          <div>
            <Button
              withOnlyIcon
              color={matchType === MatchTypes.RegExp ? 'primary' : 'secondary'}
              size='small'
              onClick={() => {
                onMatchTypeChange(
                  matchType === MatchTypes.RegExp ? null : MatchTypes.RegExp,
                );
              }}
            >
              <Icon name='regex' />
            </Button>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}

SearchBar.displayName = 'SearchBar';

export default React.memo<ISearchBarProps>(SearchBar);
