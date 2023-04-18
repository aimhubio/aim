import React from 'react';
import { NavLink } from 'react-router-dom';

import { Drawer, Tooltip } from '@material-ui/core';

import logoImg from 'assets/logo.svg';
import { ReactComponent as DiscordIcon } from 'assets/icons/discord.svg';

import { Icon, Text } from 'components/kit';
import { IconName } from 'components/kit/Icon';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import CommunityPopup from 'components/CommunityPopup';

import { PathEnum } from 'config/enums/routesEnum';
import { AIM_VERSION } from 'config/config';
import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';
import { DOCUMENTATIONS } from 'config/references';

import routes, { IRoute } from 'routes/routes';

import { trackEvent } from 'services/analytics';

import { getItem } from 'utils/storage';

import './Sidebar.scss';

function SideBar(): React.FunctionComponentElement<React.ReactNode> {
  function getPathFromStorage(route: PathEnum): PathEnum | string {
    const path = getItem(`${route.slice(1)}Url`) ?? '';
    if (path !== '' && path.startsWith(route)) {
      return path;
    }
    return route;
  }

  return (
    <ErrorBoundary>
      <div className='Sidebar'>
        <Drawer
          PaperProps={{ className: 'Sidebar__Paper' }}
          variant='permanent'
          anchor='left'
        >
          <ul className='Sidebar__List'>
            <NavLink
              exact={true}
              className='Sidebar__NavLink'
              to={routes.DASHBOARD.path}
            >
              <li className='Sidebar__List__item'>
                <img src={logoImg} alt='logo' />
              </li>
            </NavLink>
            <div className='Sidebar__List__container ScrollBar__hidden'>
              {Object.values(routes).map((route: IRoute, index: number) => {
                const { showInSidebar, path, displayName, icon } = route;
                return (
                  showInSidebar && (
                    <NavLink
                      key={index}
                      to={() => getPathFromStorage(path)}
                      exact={true}
                      isActive={(m, location) =>
                        location.pathname.split('/')[1] === path.split('/')[1]
                      }
                      activeClassName='Sidebar__NavLink--active'
                      className='Sidebar__NavLink'
                    >
                      <li className='Sidebar__List__item'>
                        <Icon
                          className='Sidebar__List__item--icon'
                          fontSize={24}
                          name={icon as IconName}
                        />
                        <span className='Sidebar__List__item--text'>
                          {displayName}
                        </span>
                      </li>
                    </NavLink>
                  )
                );
              })}
            </div>
          </ul>
          <div className='Sidebar__bottom'>
            <CommunityPopup>
              <Tooltip title='Community Discord' placement='right'>
                <a
                  target='_blank'
                  href='https://community.aimstack.io/'
                  rel='noreferrer'
                  className='Sidebar__bottom__anchor'
                  onClick={() =>
                    trackEvent(ANALYTICS_EVENT_KEYS.sidebar.discord)
                  }
                >
                  <DiscordIcon />
                </a>
              </Tooltip>
            </CommunityPopup>
            <Tooltip title='Docs' placement='right'>
              <a
                target='_blank'
                href={DOCUMENTATIONS.MAIN_PAGE}
                rel='noreferrer'
                className='Sidebar__bottom__anchor'
                onClick={() => trackEvent(ANALYTICS_EVENT_KEYS.sidebar.docs)}
              >
                <Icon name='full-docs' />
              </a>
            </Tooltip>
            <Text tint={30}>v{AIM_VERSION}</Text>
          </div>
        </Drawer>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SideBar);
