import React from 'react';
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
                <Route path={routes.RUNS.path}>
                  <routes.RUNS.component />
                </Route>
                <Route path={routes.METRICS.path}>
                  <routes.METRICS.component />
                </Route>
              </Switch>
            </React.Suspense>
          </Box>
        </Theme>
      </BrowserRouter>
    </>
  );
}

export default App;
