import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useModel } from 'hooks';

import { loader } from '@monaco-editor/react';

import AlertBanner from 'components/kit/AlertBanner';
import SideBar from 'components/SideBar/SideBar';
import ProjectWrapper from 'components/ProjectWrapper/ProjectWrapper';
import Theme from 'components/Theme/Theme';
import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { getBasePath } from 'config/config';

import PageWrapper from 'pages/PageWrapper';

import routes from 'routes/routes';

import projectsModel from 'services/models/projects/projectsModel';

import { IProjectsModelState } from './types/services/models/projects/projectsModel';
import usePyodide from './services/pyodide/usePyodide';

import './App.scss';

const basePath = getBasePath(false);

// loading monaco from node modules instead of CDN
loader.config({
  paths: {
    vs: `${getBasePath()}/static-files/vs`,
  },
});

function App(): React.FunctionComponentElement<React.ReactNode> {
  const projectsData = useModel<Partial<IProjectsModelState>>(projectsModel);
  const { loadPyodide } = usePyodide();

  React.useEffect(() => {
    let timeoutId: number;
    const preloader = document.getElementById('preload-spinner');
    if (preloader) {
      preloader.classList.add('preloader-fade-out');
      timeoutId = window.setTimeout(() => {
        preloader.remove();
      }, 500);
    }

    loadPyodide();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <BrowserRouter basename={basePath}>
      <ProjectWrapper />
      <Theme>
        {projectsData?.project?.warn_index && (
          <AlertBanner type='warning'>
            Index db was corrupted and deleted. Please run
            <b>`aim storage reindex`</b> command to restore optimal performance.
          </AlertBanner>
        )}
        {projectsData?.project?.warn_runs && (
          <AlertBanner type='warning'>
            Corrupted runs were detected. Please run
            <b>`aim runs rm --corrupted`</b> command to remove corrupted runs.
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
