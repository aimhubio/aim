import React from 'react';
import { NavLink } from 'react-router-dom';
import { IRoute, routes } from 'routes/routes';
import { Drawer } from '@material-ui/core';

import { ThemeContext } from 'components/Theme/Theme';
import Icon from 'components/Icon/Icon';
import { IThemeContextValues } from 'types/components/Theme/Theme';
import { IconName } from 'types/components/Icon/Icon';

import logoImg from 'assets/logo.svg';

import './Sidebar.scss';

function SideBar(): React.FunctionComponentElement<React.ReactNode> {
  const { dark, handleTheme } = React.useContext(
    ThemeContext,
  ) as IThemeContextValues;

  return (
    <div className='Sidebar__container'>
      <Drawer
        PaperProps={{ className: 'Sidebar__Paper' }}
        variant='permanent'
        anchor='left'
      >
        <ul className='Sidebar__List'>
          <NavLink
            exact={true}
            activeClassName={'Sidebar__anchor__active'}
            className='Sidebar__anchor'
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
                  to={path}
                  exact={true}
                  activeClassName={'Sidebar__anchor__active'}
                  className='Sidebar__anchor'
                >
                  <li className='Sidebar__List__item'>
                    <Icon
                      className='Sidebar__List__item__icon'
                      fontSize={24}
                      name={icon as IconName}
                    />
                    <span className='Sidebar__List__item__text'>
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
