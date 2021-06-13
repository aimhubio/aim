import './HubBookmarksScreen.less';

import React, { useRef, useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import * as classes from '../../../constants/classes';
import * as storeUtils from '../../../storeUtils';
import Alert from '../HubMainScreen/components/Alert/Alert';
import UI from '../../../ui';
import { Link } from 'react-router-dom';
import * as screens from '../../../constants/screens';
import { buildUrl } from '../../../utils';

function HubBookmarksScreen(props) {
  const projectWrapperRef = useRef();
  const [bookmarks, setBookmarks] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([props.getDashboardsList(), props.getAppsList()])
      .then(([dashboards, apps]) => {
        const bookmarks = [];
        dashboards.forEach((dashboard) => {
          apps.forEach((app) => {
            if (dashboard.app_id === app.id) {
              bookmarks.push({
                ...dashboard,
                app_state: app.app_state,
              });
              console.log(app.app_state);
            }
          });
        });
        setBookmarks(
          bookmarks.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          ),
        );
      })
      .catch((err) => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <ProjectWrapper size='fluid' gap={false} ref={projectWrapperRef}>
      <div className='HubBookmarksScreen__wrapper'>
        {isLoading ? (
          <div />
        ) : bookmarks.length === 0 ? (
          <Alert segment>
            <UI.Text type='grey' center>
              You don't have any bookmarks.
            </UI.Text>
            <UI.Text type='grey' center>
              Navigate to{' '}
              <Link to={screens.EXPLORE}>explore metrics screen</Link> where you
              can save current state as bookmark.
            </UI.Text>
          </Alert>
        ) : (
          <div className='HubBookmarksScreen__grid'>
            {bookmarks.map((bookmark) => (
              <Link
                className='HubBookmarksScreen__grid__item'
                key={bookmark.app_id}
                to={buildUrl(screens.EXPLORE_BOOKMARK, {
                  bookmark_id: bookmark.app_id,
                })}
              >
                <UI.Text className='HubBookmarksScreen__grid__item__heading'>
                  {bookmark.name ?? 'None'}
                </UI.Text>
                <UI.Text className='HubBookmarksScreen__grid__item__title'>
                  {bookmark.description ?? 'N/A'}
                </UI.Text>
                <UI.Text className='HubBookmarksScreen__grid__item__heading'>
                  {bookmark.app_state?.searchInput?.selectInput}
                </UI.Text>
                <UI.Text className='HubBookmarksScreen__grid__item__title'>
                  {bookmark.app_state?.searchInput?.selectConditionInput}
                </UI.Text>
                <div className='HubBookmarksScreen__grid__item__icon'>
                  <UI.Icon i='bookmark' spacingRight={false} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProjectWrapper>
  );
}

export default withRouter(
  storeUtils.getWithState(classes.HUB_BOOKMARKS_SCREEN, HubBookmarksScreen),
);
