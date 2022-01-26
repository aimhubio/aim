import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import AlertBanner from 'components/kit/AlertBanner';
import SideBar from 'components/SideBar/SideBar';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { getBasePath } from 'config/config';

import routes from 'routes/routes';

import { inIframe } from 'utils/helper';

import './App.scss';

const basePath = getBasePath(false);

const cacheBannerPaths = ['/notebook']; // @TODO move cacheBannerPaths list to constants
const isVisibleCacheBanner = cacheBannerPaths.includes(basePath) && inIframe();

function App(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <>
      <BrowserRouter basename={basePath}>
        <ProjectWrapper />
        <Theme>
          {isVisibleCacheBanner && (
            <AlertBanner type='warning' isVisiblePermanently={true}>
              You are using UI from notebook env, please make sure to{' '}
              <b>keep server running</b> for a better experience
            </AlertBanner>
          )}
          <div className='pageContainer'>
            <ErrorBoundary>
              <SideBar />
            </ErrorBoundary>
            <div className='mainContainer'>
              <React.Suspense
                fallback={<BusyLoaderWrapper height='100%' isLoading />}
              >
                <Switch>
                  {Object.values(routes).map((route, index) => {
                    const { component: Component, path, isExact } = route;
                    return (
                      <Route path={path} key={index} exact={isExact}>
                        <ErrorBoundary>
                          <Component />
                        </ErrorBoundary>
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
