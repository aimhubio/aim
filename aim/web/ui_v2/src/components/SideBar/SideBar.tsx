import React from 'react';
import { NavLink } from 'react-router-dom';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import { PATHS } from 'routes/routes';

function SideBar(): React.FunctionComponentElement<unknown> {
  return (
    <Drawer variant='permanent' anchor='left'>
      <Divider />
      <List>
        <NavLink to={PATHS.RUNS}>
          <ListItem button>
            <ListItemText primary='Runs' />
          </ListItem>
        </NavLink>
        <NavLink to={PATHS.METRICS}>
          <ListItem button>
            <ListItemText primary='Metrics' />
          </ListItem>
        </NavLink>
      </List>
    </Drawer>
  );
}

export default SideBar;
