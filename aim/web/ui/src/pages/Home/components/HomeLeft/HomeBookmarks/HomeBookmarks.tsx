import React from 'react';
import { useHistory } from 'react-router-dom';

import { IResourceState } from 'modules/core/utils/createResource';
import { IDashboardData } from 'modules/core/api/dashboardsApi';
import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';
import ListItem from 'components/kit/ListItem/ListItem';

import createBookmarksEngine from './HomeBookmarksStore';

import './HomeBookmarks.scss';

function HomeBookmarks() {
  const history = useHistory();
  const { current: bookmarksEngine } = React.useRef(createBookmarksEngine);
  const bookmarksStore: IResourceState<IDashboardData> =
    bookmarksEngine.bookmarksState((state) => state);

  React.useEffect(() => {
    bookmarksEngine.fetchBookmarks();
    return () => {
      bookmarksEngine.bookmarksState.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick: (
    e: React.MouseEvent<HTMLElement>,
    dashboard: IDashboardData,
    newTab?: boolean,
  ) => void = React.useCallback(
    (
      e: React.MouseEvent<HTMLElement>,
      dashboard: IDashboardData,
      newTab = false,
    ) => {
      e.stopPropagation();
      if (dashboard) {
        const path = `/${dashboard.app_id}`;
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
    <div className='HomeBookmarks'>
      <Text size={18}>Bookmarks</Text>
      <div className='HomeBookmarks__list'>
        {bookmarksStore.data?.map((dashboard: IDashboardData) => (
          <Tooltip title={dashboard.description} key={dashboard.id}>
            <div>
              <ListItem className='HomeBookmarks__item'>
                <Icon name='metrics' box />
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
