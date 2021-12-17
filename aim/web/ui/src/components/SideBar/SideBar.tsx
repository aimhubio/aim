import React from 'react';
import { NavLink } from 'react-router-dom';

import { Drawer } from '@material-ui/core';

import logoImg from 'assets/logo.svg';

import { Icon } from 'components/kit';
import { IconName } from 'components/kit/Icon';

import { PathEnum } from 'config/enums/routesEnum';

import routes, { IRoute } from 'routes/routes';

import './Sidebar.scss';

function SideBar(): React.FunctionComponentElement<React.ReactNode> {
  function getPathFromStorage(route: PathEnum): PathEnum | string {
    switch (route) {
      case PathEnum.Metrics:
        if (localStorage.getItem('metricsUrl')) {
          return localStorage.getItem('metricsUrl') || '';
        }
        return route;
      case PathEnum.Params:
        if (localStorage.getItem('paramsUrl')) {
          return localStorage.getItem('paramsUrl') || '';
        }
        return route;
      case PathEnum.Runs:
        if (localStorage.getItem('runsUrl')) {
          return localStorage.getItem('runsUrl') || '';
        }
        return route;
      case PathEnum.Images_Explore:
        if (localStorage.getItem('imagesExploreUrl')) {
          return localStorage.getItem('imagesExploreUrl') || '';
        }
        return route;
      case PathEnum.Scatters:
        if (localStorage.getItem('scattersUrl')) {
          return localStorage.getItem('scattersUrl') || '';
        }
        return route;
      default:
        return route;
    }
  }

  return (
    <div className='Sidebar'>
      <Drawer
        PaperProps={{ className: 'Sidebar__Paper' }}
        variant='permanent'
        anchor='left'
      >
        <ul className='Sidebar__List'>
          <NavLink
            exact={true}
            activeClassName={'Sidebar__NavLink--active'}
            className='Sidebar__NavLink'
            to={routes.HOME.path}
          >
            <li className='Sidebar__List__item'>
              <img src={logoImg} alt='logo' />
            </li>
          </NavLink>
          {Object.values(routes).map((route: IRoute, index: number) => {
            const { showInSidebar, path, displayName, icon } = route;
            return (
              showInSidebar && (
                <NavLink
                  key={index}
                  to={() => getPathFromStorage(path)}
                  exact={true}
                  isActive={(m, location) => {
                    let split = location.pathname.split('/');
                    return split.includes(path.split('/')[1]);
                  }}
                  activeClassName={'Sidebar__NavLink--active'}
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
        </ul>
      </Drawer>
    </div>
  );
}

export default React.memo(SideBar);
