import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Box } from '@material-ui/core';

import SideBar from 'components/SideBar/SideBar';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';
import { routes } from 'routes/routes';

import styles from './appStyles.module.scss';

function App(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <>
      <BrowserRouter>
        <ProjectWrapper />
        <Theme>
          <Box display='flex'>
            <SideBar />
            <Box className={styles.mainContainer}>
              <React.Suspense fallback={null}>
                <Switch>
                  {Object.values(routes).map((route, index) => {
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
          </Box>
        </Theme>
      </BrowserRouter>
    </>
  );
}

export default App;
