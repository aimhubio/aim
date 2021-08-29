import React from 'react';
import { NavLink } from 'react-router-dom';
import { routes } from 'routes/routes';
import { Drawer } from '@material-ui/core';
import TimelineOutlinedIcon from '@material-ui/icons/TimelineOutlined';

import { ThemeContext } from 'components/Theme/Theme';
import { IThemeContextValues } from 'types/components/Theme/Theme';
import logoImg from 'assets/logo-white.png';

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
          {Object.values(routes).map((route, index) => {
            const { showInSidebar, path, displayName } = route;
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
                    <TimelineOutlinedIcon className='Sidebar__List__item__icon' />
                    <span className='Sidebar__List__item__text'>
                      {displayName}
                    </span>
                  </li>
                </NavLink>
              )
            );
          })}
          {/* <ListItem className={classes.listItem} onClick={handleTheme}>
          {dark ? <Brightness7Icon /> : <Brightness4Icon />}
        </ListItem> */}
        </ul>
      </Drawer>
    </div>
  );
}

export default React.memo(SideBar);
