import React from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from 'components/Theme/Theme';
import { IThemeContextValues } from 'types/components/Theme/Theme';

import { PATHS } from 'routes/routes';
import { ListItem, List, Drawer, ListItemText } from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import TimelineOutlinedIcon from '@material-ui/icons/TimelineOutlined';
import useStyles from './sidebarStyle';

import logoImg from 'assets/logo-white.png';

function SideBar(): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();
  const { dark, handleTheme } = React.useContext(
    ThemeContext,
  ) as IThemeContextValues;

  return (
    <Drawer
      PaperProps={{ className: classes.paper }}
      variant='permanent'
      anchor='left'
    >
      <List className={classes.list}>
        <ListItem className={classes.listItem}>
          <img className={classes.logo} src={logoImg} alt='logo' />
        </ListItem>
        <NavLink
          activeClassName={classes.anchorActive}
          className={classes.anchor}
          to={PATHS.RUNS}
        >
          <ListItem className={classes.listItem} button>
            <TimelineOutlinedIcon />
            <ListItemText
              primaryTypographyProps={{ className: classes.listItemText }}
              primary='Runs'
            />
          </ListItem>
        </NavLink>
        <NavLink
          activeClassName={classes.anchorActive}
          className={classes.anchor}
          to={PATHS.METRICS}
        >
          <ListItem className={classes.listItem} button>
            <TimelineOutlinedIcon />
            <ListItemText
              primaryTypographyProps={{ className: classes.listItemText }}
              primary='Metrics'
            />
          </ListItem>
        </NavLink>
        {/* <ListItem className={classes.listItem} onClick={handleTheme}>
          {dark ? <Brightness7Icon /> : <Brightness4Icon />}
        </ListItem> */}
      </List>
    </Drawer>
  );
}

export default React.memo(SideBar);
