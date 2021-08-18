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
    <Drawer
      PaperProps={{ className: 'Sidebar__container' }}
      variant='permanent'
      anchor='left'
    >
      <ul className='Sidebar__List'>
        <li className='Sidebar__List__item'>
          <img src={logoImg} alt='logo' />
        </li>
        {Object.values(routes).map((route, index) => {
          const { showInSidebar, path, displayName } = route;

          return (
            showInSidebar && (
              <NavLink
                activeClassName={'Sidebar__anchor__active'}
                className='Sidebar__anchor'
                to={path}
                key={index}
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
  );
}

export default React.memo(SideBar);
