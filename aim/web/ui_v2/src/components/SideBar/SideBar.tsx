import React from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from 'components/Theme/Theme';
import { IThemeContextValues } from 'types/components/Theme/Theme';

import { PATHS } from 'routes/routes';
import {
  makeStyles,
  ListItem,
  List,
  Drawer,
  ListItemText,
} from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';

const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(0.5),
    fontSize: '12px',
  },
}));

function SideBar(): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();
  const { dark, handleTheme } = React.useContext(
    ThemeContext,
  ) as IThemeContextValues;

  return (
    <Drawer variant='permanent' anchor='left'>
      <List>
        <NavLink to={PATHS.RUNS}>
          <ListItem className={classes.listItem} button>
            <ListItemText primary='Runs' />
          </ListItem>
        </NavLink>
        <NavLink to={PATHS.METRICS}>
          <ListItem className={classes.listItem} button>
            <ListItemText primary='Metrics' />
          </ListItem>
        </NavLink>
        <ListItem>
          <div onClick={handleTheme}>
            {dark ? <Brightness7Icon /> : <Brightness4Icon />}
          </div>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default React.memo(SideBar);
