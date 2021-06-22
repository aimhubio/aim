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
import { buildUrl, classNames } from '../../../utils';
import * as analytics from '../../../services/analytics';

function HubBookmarksScreen(props) {
  const projectWrapperRef = useRef();
  const [bookmarks, setBookmarks] = useState([]);
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

    // Analytics
    analytics.pageView('Bookmarks');
  }, []);

  return (
    <ProjectWrapper size='fluid' ref={projectWrapperRef}>
      <div>
        {isLoading ? (
          <div />
        ) : (
          <UI.Container size='small'>
            <div className='HubBookmarksScreen__header'>
              <UI.Text size={6}>Bookmarks List</UI.Text>
            </div>
            <div>
              {bookmarks.length === 0 ? (
                <Alert segment>
                  <UI.Text type='grey' center>
                    You haven't created any bookmark yet.
                  </UI.Text>
                  <UI.Text type='grey' center>
                    Go to the{' '}
                    <Link to={screens.EXPLORE}> metrics explorer</Link> to
                    create your first bookmark.
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
                      <div className='HubBookmarksScreen__grid__item__header'>
                        <div className='HubBookmarksScreen__grid__item__icon'>
                          <UI.Icon i='bookmark' spacingRight={false} />
                        </div>
                        <UI.Text>{bookmark.name ?? 'None'}</UI.Text>
                        {!!bookmark.description && (
                          <UI.Text>{bookmark.description ?? 'N/A'}</UI.Text>
                        )}
                      </div>
                      <div className='HubBookmarksScreen__grid__item__form'>
                        <UI.Text>
                          <UI.Text
                            inline
                            className='HubBookmarksScreen__grid__item__form__tag'
                          >
                            select
                          </UI.Text>{' '}
                          {bookmark.app_state?.searchInput?.selectInput}
                        </UI.Text>
                        {!!bookmark.app_state?.searchInput
                          ?.selectConditionInput && (
                          <UI.Text>
                            <UI.Text
                              inline
                              className='HubBookmarksScreen__grid__item__form__tag'
                            >
                              if
                            </UI.Text>{' '}
                            {
                              bookmark.app_state?.searchInput
                                ?.selectConditionInput
                            }
                          </UI.Text>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </UI.Container>
        )}
      </div>
    </ProjectWrapper>
  );
}

export default withRouter(
  storeUtils.getWithState(classes.HUB_BOOKMARKS_SCREEN, HubBookmarksScreen),
);
