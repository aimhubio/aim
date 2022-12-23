import React from 'react';
import { NavLink } from 'react-router-dom';

import { Tooltip } from '@material-ui/core';

import { Button, Icon, Text } from 'components/kit';
import ListItem from 'components/kit/ListItem/ListItem';

import { IDashboardData } from 'modules/core/api/dashboardsApi';

import { BookmarkIconType } from 'pages/Bookmarks/components/BookmarkCard/BookmarkCard';

import useDashboardBookmarks from './useDashboardBookmarks';

import './DashboardBookmarks.scss';

function DashboardBookmarks(): React.FunctionComponentElement<React.ReactNode> | null {
  const { dashboardBookmarksStore, handleClick } = useDashboardBookmarks();

  return dashboardBookmarksStore.data?.length ? (
    <div className='DashboardBookmarks'>
      <Text
        className='DashboardBookmarks__title'
        size={14}
        weight={700}
        tint={100}
        component='h3'
      >
        Bookmarks{' '}
        {dashboardBookmarksStore.data.length
          ? `(${dashboardBookmarksStore.data.length})`
          : ''}
      </Text>
      <div className='DashboardBookmarks__list'>
        {dashboardBookmarksStore.data
          .slice(0, 5)
          ?.map((dashboard: IDashboardData) => (
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
                    size={12}
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
      {dashboardBookmarksStore.data.length > 5 ? (
        <NavLink className='DashboardBookmarks__NavLink' to='/bookmarks'>
          <Button fullWidth variant='outlined' size='xSmall'>
            See all bookmarks
          </Button>
        </NavLink>
      ) : null}
    </div>
  ) : null;
}

export default React.memo(DashboardBookmarks);
