import React from 'react';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ListItem from 'components/kit/ListItem/ListItem';

import { DATE_QUERY_FORMAT } from 'config/dates/dates';

import { encode } from 'utils/encoder/encoder';

import './QuickLinks.scss';

function QuickLinks(): React.FunctionComponentElement<React.ReactNode> {
  const history = useHistory();

  const onClick: (
    e: React.MouseEvent<HTMLElement>,
    value: string,
    newTab?: boolean,
  ) => void = React.useCallback(
    (e: React.MouseEvent<HTMLElement>, value: string, newTab = false) => {
      e.stopPropagation();
      if (value) {
        const query = `run.${value.toLowerCase()} == True`;
        const search = encode({
          query,
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

  function exploreLastWeekRuns() {
    const search = encode({
      query: `datetime(${moment()
        .subtract(7, 'day')
        .format(
          DATE_QUERY_FORMAT,
        )}) <= run.created_at < datetime(${moment().format(
        DATE_QUERY_FORMAT,
      )})`,
    });
    history.push(`/runs?select=${search}`);
  }

  const linkItems: { path: string; label: string; handleClick: any }[] =
    React.useMemo(() => {
      return [
        {
          path: 'active',
          label: 'Active runs',
          handleClick: onClick,
        },
        {
          path: 'archived',
          label: 'Archived runs',
          handleClick: onClick,
        },
        {
          path: 'latest',
          label: "Last week's runs",
          handleClick: exploreLastWeekRuns,
        },
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <div className='QuickLinks'>
      <Text
        className='QuickLinks__title'
        component='h3'
        size={14}
        tint={100}
        weight={700}
      >
        Quick navigation
      </Text>
      <div className='QuickLinks__list'>
        {linkItems.map(({ label, path, handleClick }) => (
          <ListItem
            size='small'
            className='QuickLinks__list__ListItem'
            key={path}
          >
            <Text
              className='QuickLinks__list__ListItem__Text'
              onClick={(e) => handleClick(e, path)}
              size={12}
              tint={100}
            >
              {label}
            </Text>
            <Tooltip title='Explore in new tab'>
              <div>
                <Icon
                  fontSize={12}
                  onClick={(e) => handleClick(e, path)}
                  name='new-tab'
                />
              </div>
            </Tooltip>
          </ListItem>
        ))}
      </div>
    </div>
  );
}

export default QuickLinks;
