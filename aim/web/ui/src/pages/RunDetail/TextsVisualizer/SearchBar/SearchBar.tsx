import React from 'react';

import { Tooltip } from '@material-ui/core';

import Icon from 'components/kit/Icon';
import Button from 'components/kit/Button';

import SearchInput from './SearchInput';

import './SearchBar.scss';

interface ISearchBarProps {
  isCaseMatchActive?: boolean;
  isWordMatchActive?: boolean;
  isRegexpMatchActive?: boolean;
}

function SearchBar(props: ISearchBarProps) {
  return (
    <div className='SearchBar'>
      <SearchInput value={'test'} />
      <div className='MatchIcons'>
        <Tooltip title='Match Case'>
          <div>
            <Button
              withOnlyIcon
              color={props.isCaseMatchActive ? 'primary' : 'secondary'}
              size='small'
              onClick={() => {
                console.log('clear');
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
              color={props.isWordMatchActive ? 'primary' : 'secondary'}
              size='small'
              onClick={() => {
                console.log('clear');
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
              color={props.isRegexpMatchActive ? 'primary' : 'secondary'}
              size='small'
              onClick={() => {
                console.log('clear');
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

export default SearchBar;
