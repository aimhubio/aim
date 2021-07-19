import React from 'react';
import { values } from 'lodash-es';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Box, makeStyles } from '@material-ui/core';

import SideBar from 'components/SideBar/SideBar';
import { routes } from 'routes/routes';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';

const useStyles = makeStyles(({ spacing }) => ({
  main: {
    paddingLeft: spacing(8.75),
  },
}));

function App(): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();

  return (
    <>
      <BrowserRouter>
        <ProjectWrapper />
        <Theme>
          <SideBar />
          <Box component='main' bgcolor='grey.200' className={classes.main}>
            <React.Suspense fallback={null}>
              <Switch>
                {values(routes).map((route, index) => {
                  const { component: Component, path } = route;
                  return (
                    <Route path={path} key={index}>
                      <Component />
                    </Route>
                  );
                })}
              </Switch>
            </React.Suspense>
          </Box>
        </Theme>
      </BrowserRouter>
    </>
  );
}

export default App;
