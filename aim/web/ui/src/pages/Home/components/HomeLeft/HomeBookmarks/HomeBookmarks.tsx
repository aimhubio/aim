import React from 'react';

import { IDashboardData } from 'modules/core/api/dashboardsApi';
import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ListItem from 'components/kit/ListItem/ListItem';

import { BookmarkIconType } from 'pages/Bookmarks/components/BookmarkCard/BookmarkCard';

import useHomeBookmarks from './useHomeBookmarks';

import './HomeBookmarks.scss';

function HomeBookmarks() {
  const { bookmarksStore, handleClick } = useHomeBookmarks();

  return (
    <div className='HomeBookmarks'>
      <Text size={18}>Bookmarks</Text>
      <div className='HomeBookmarks__list'>
        {bookmarksStore.data?.map((dashboard: IDashboardData) => (
          <Tooltip
            placement='bottom-start'
            title={dashboard.description}
            key={dashboard.id}
          >
            <div>
              <ListItem className='HomeBookmarks__list__ListItem'>
                <Icon name={BookmarkIconType[dashboard.app_type].name} box />
                <Text
                  className='HomeBookmarks__list__ListItem__Text'
                  onClick={(e) => handleClick(e, dashboard)}
                  size={14}
                  tint={100}
                >
                  {dashboard.name}
                </Text>
                <div>
                  <Icon
                    box
                    fontSize={12}
                    onClick={(e) => handleClick(e, dashboard, true)}
                    name='new-tab'
                  />
                </div>
              </ListItem>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export default React.memo(HomeBookmarks);
