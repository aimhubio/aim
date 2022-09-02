import React from 'react';
import { useHistory } from 'react-router-dom';

import { MenuItem, Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';

import { encode } from 'utils/encoder/encoder';

import './QuickLinks.scss';

const linkItems: string[] = ['active', 'archived'];

function QuickLinks(): React.FunctionComponentElement<React.ReactNode> {
  const history = useHistory();

  const onClick: (
    e: React.MouseEvent<HTMLElement>,
    value: string,
    newTab?: boolean,
  ) => void = React.useCallback(
    (e: React.MouseEvent<HTMLElement>, value: string, newTab = false) => {
      e.stopPropagation();
      e.preventDefault();
      if (value) {
        const query = `run.${value} == True`;
        const search = encode({
          query,
          advancedMode: true,
          advancedQuery: query,
        });
        const path = `/runs?select=${search}`;
        if (newTab) {
          window.open(path, '_blank');
          window.focus();
          return;
        }
        history.push(path);
      }
    },
    [history],
  );

  return (
    <div className='QuickLinks'>
      <Text component='h3' size={18}>
        Quick Links
      </Text>
      <div className='QuickLinks__menu'>
        {linkItems.map((item: string) => (
          <MenuItem className='QuickLinks__menu__MenuItem' key={item}>
            <Text
              className='QuickLinks__menu__MenuItem__Text'
              onClick={(e) => onClick(e, item)}
              size={14}
              tint={100}
            >
              {item} runs
            </Text>
            <Tooltip title='Explore in new tab'>
              <div>
                <Icon
                  box
                  fontSize={12}
                  onClick={(e) => onClick(e, item, true)}
                  name='new-tab'
                />
              </div>
            </Tooltip>
          </MenuItem>
        ))}
      </div>
    </div>
  );
}

export default QuickLinks;
