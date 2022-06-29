import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { loader } from '@monaco-editor/react';

import AlertBanner from 'components/kit/AlertBanner';
import SideBar from 'components/SideBar/SideBar';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { checkIsBasePathInCachedEnv, getBasePath } from 'config/config';

import PageWrapper from 'pages/PageWrapper';

import routes from 'routes/routes';

import { inIframe } from 'utils/helper';

import './App.scss';

const basePath = getBasePath(false);

const isVisibleCacheBanner = checkIsBasePathInCachedEnv(basePath) && inIframe();

// loading monaco from node modules instead of CDN
loader.config({
  paths: {
    vs: `${getBasePath()}/static-files/vs`,
  },
});

function App(): React.FunctionComponentElement<React.ReactNode> {
  React.useEffect(() => {
    let timeoutId: number;
    const preloader = document.getElementById('preload-spinner');
    if (preloader) {
      preloader.classList.add('preloader-fade-out');
      timeoutId = window.setTimeout(() => {
        preloader.remove();
      }, 500);
    }
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <BrowserRouter basename={basePath}>
      <ProjectWrapper />
      <Theme>
        {isVisibleCacheBanner && (
          <AlertBanner type='warning' isVisiblePermanently={true}>
            You are using UI from notebook env, please make sure to
            <b>keep server running</b> for a better experience
          </AlertBanner>
        )}
        <div className='pageContainer'>
          <ErrorBoundary>
            <SideBar />
          </ErrorBoundary>
          <div className='mainContainer'>
            <React.Suspense
              fallback={<BusyLoaderWrapper height='100vh' isLoading />}
            >
              <Switch>
                {Object.values(routes).map((route, index) => {
                  const { component: Component, path, isExact, title } = route;
                  return (
                    <Route path={path} key={index} exact={isExact}>
                      <ErrorBoundary>
                        <PageWrapper path={path} title={title}>
                          <Component />
                        </PageWrapper>
                      </ErrorBoundary>
                    </Route>
                  );
                })}
                <Redirect to='/' />
              </Switch>
            </React.Suspense>
          </div>
        </div>
      </Theme>
    </BrowserRouter>
  );
}

export default App;
