import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import SideBar from 'components/SideBar/SideBar';
import { routes } from 'routes/routes';
import { makeStyles } from '@material-ui/core';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';

const useStyles = makeStyles({
  main: {
    paddingLeft: 70,
  },
});

function App(): React.FunctionComponentElement<React.ReactNode> {
  const classes = useStyles();

  return (
    <BrowserRouter>
      <ProjectWrapper />
      <Theme>
        <SideBar />
        <main className={classes.main}>
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
        </main>
      </Theme>
    </BrowserRouter>
  );
}

export default App;
