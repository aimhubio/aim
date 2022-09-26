import React from 'react';

import { IDashboardData } from 'modules/core/api/dashboardsApi';
import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ListItem from 'components/kit/ListItem/ListItem';

import { BookmarkIconType } from 'pages/Bookmarks/components/BookmarkCard/BookmarkCard';

import useDashboardBookmarks from './useDashboardBookmarks';

import './DashboardBookmarks.scss';

function DashboardBookmarks() {
  const { dashboardBookmarksStore, handleClick } = useDashboardBookmarks();

  return (
    <div className='DashboardBookmarks'>
      <Text
        className='DashboardBookmarks__title'
        size={14}
        weight={700}
        tint={100}
        component='h3'
      >
        Bookmarks
      </Text>
      <div className='DashboardBookmarks__list'>
        {dashboardBookmarksStore.data?.map((dashboard: IDashboardData) => (
          <Tooltip
            placement='bottom-start'
            title={dashboard.description}
            key={dashboard.id}
          >
            <div>
              <ListItem
                size='small'
                className='DashboardBookmarks__list__ListItem'
              >
                <Icon
                  fontSize={12}
                  name={BookmarkIconType[dashboard.app_type].name}
                />
                <Text
                  className='DashboardBookmarks__list__ListItem__Text'
                  onClick={(e) => handleClick(e, dashboard)}
                  size={14}
                  tint={100}
                >
                  {dashboard.name}
                </Text>
                <div>
                  <Icon
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

export default React.memo(DashboardBookmarks);
