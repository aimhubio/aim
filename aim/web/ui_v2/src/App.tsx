import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import SideBar from './components/SideBar/SideBar';
import { routes } from './routes/routes';

function App(): React.FunctionComponentElement<{}> {
  return (
    <BrowserRouter>
      <div className="App">
        <SideBar />
        <main>
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
      </div>
    </BrowserRouter>
  );
}

export default App;
