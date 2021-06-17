import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

function SideBar(): React.FunctionComponentElement<{}> {
  return (
    <div>
      <Drawer
        variant="permanent"
        anchor="left"
      >
        <Divider />
        <List>
          {['Runs', 'Metrics', 'Correlations', 'Tags', 'Bookmarks'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </div>
  );
}

export default SideBar;
