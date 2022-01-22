import React from 'react';
import classNames from 'classnames';

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
  isDisabled,
}: ISearchBarProps) {
  return (
    <div className='SearchBar'>
      <SearchInput
        value={searchValue}
        onInputClear={onInputClear}
        onInputChange={onInputChange}
        isValidInput={isValidInput}
        isDisabled={isDisabled}
      />
      <div className='MatchIcons'>
        <Tooltip title='Match Case'>
          <div
            className={classNames({
              MatchButton: true,
              active: matchType === MatchTypes.Case,
            })}
          >
            <Button
              withOnlyIcon
              color={matchType === MatchTypes.Case ? 'primary' : 'secondary'}
              size='small'
              disabled={isDisabled}
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
          <div
            className={classNames({
              MatchButton: true,
              active: matchType === MatchTypes.Word,
            })}
          >
            <Button
              withOnlyIcon
              color={matchType === MatchTypes.Word ? 'primary' : 'secondary'}
              size='small'
              disabled={isDisabled}
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
              color={matchType === MatchTypes.RegExp ? 'primary' : 'secondary'}
              size='small'
              disabled={isDisabled}
              className={classNames({
                MatchButton: true,
                active: matchType === MatchTypes.RegExp,
              })}
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
  );
}

SearchBar.displayName = 'SearchBar';

export default React.memo<ISearchBarProps>(SearchBar);
