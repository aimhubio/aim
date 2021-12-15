import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import SideBar from 'components/SideBar/SideBar';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';

import routes from 'routes/routes';

import './App.scss';

let basePath = '/';

if ((window as any).API_BASE_PATH !== '{{ base_path }}') {
  basePath = (window as any).API_BASE_PATH;
}

function App(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <>
      <BrowserRouter basename={basePath}>
        <ProjectWrapper />
        <Theme>
          <div className='pageContainer'>
            <SideBar />
            <div className='mainContainer'>
              <React.Suspense fallback={null}>
                <Switch>
                  {Object.values(routes).map((route, index) => {
                    const { component: Component, path } = route;
                    return (
                      <Route path={path} key={index} exact>
                        <Component />
                      </Route>
                    );
                  })}
                </Switch>
              </React.Suspense>
            </div>
          </div>
        </Theme>
      </BrowserRouter>
    </>
  );
}

export default App;
