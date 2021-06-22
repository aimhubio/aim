import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import SideBar from 'components/SideBar/SideBar';
import { routes } from 'routes/routes';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, Grid } from '@material-ui/core';

const light = createMuiTheme({
  palette: {
    primary: {
      main: '#3b5896',
    },
  },
});

const dark = createMuiTheme({
  palette: {
    primary: {
      main: '#64b5f6',
    },
  },
});

const themes = {
  dark,
  light,
};

function App(): React.FunctionComponentElement<unknown> {
  // const [theme, setTheme] = useState<string>('light');
  return (
    <BrowserRouter>
      <ThemeProvider theme={themes.light}>
        <Grid container>
          <Grid item xs={4}>
            <SideBar />
          </Grid>
          <Grid item xs={8}>
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
          </Grid>
        </Grid>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
