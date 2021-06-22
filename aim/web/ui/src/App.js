import './App.less';

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import { ToastProvider } from 'react-toast-notifications';

import * as screens from './constants/screens';
import * as classes from './constants/classes';
import * as storeUtils from './storeUtils';
import * as analytics from './services/analytics';
import Header from './components/global/Header/Header';
import { setCookie } from './services/cookie';
import { TIMEZONE_COOKIE_NAME } from './config';

const HubMainScreen = lazy(() =>
  import('./screens/hub/HubMainScreen/HubMainScreen'),
);
const HubExperimentScreen = lazy(() =>
  import('./screens/hub/HubExperimentScreen/HubExperimentScreen'),
);
const HubExperimentsDashboardScreen = lazy(() =>
  import(
    './screens/hub/HubExperimentsDashboardScreen/HubExperimentsDashboardScreen'
  ),
);
const HubTagsScreen = lazy(() =>
  import('./screens/hub/HubTagsScreen/HubTagsScreen'),
);
const HubTagCreateScreen = lazy(() =>
  import('./screens/hub/HubTagCreateScreen/HubTagCreateScreen'),
);
const HubTagDetailScreen = lazy(() =>
  import('./screens/hub/HubTagDetailScreen/HubTagDetailScreen'),
);
const HubTFSummaryListScreen = lazy(() =>
  import('./screens/hub/HubTFSummaryListScreen/HubTFSummaryListScreen'),
);
const HubExecutablesScreen = lazy(() =>
  import('./screens/hub/HubExecutablesScreen/HubExecutablesScreen'),
);
const HubExecutableCreateScreen = lazy(() =>
  import('./screens/hub/HubExecutableCreateScreen/HubExecutableCreateScreen'),
);
const HubExecutableDetailScreen = lazy(() =>
  import('./screens/hub/HubExecutableDetailScreen/HubExecutableDetailScreen'),
);
const HubExecutableProcessDetailScreen = lazy(() =>
  import(
    './screens/hub/HubExecutableProcessDetailScreen/HubExecutableProcessDetailScreen'
  ),
);
const HubBookmarksScreen = lazy(() =>
  import('./screens/hub/HubBookmarksScreen/HubBookmarksScreen'),
);
const SiteNotFoundScreen = lazy(() =>
  import('./screens/site/SiteNotFoundScreen/SiteNotFoundScreen'),
);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };

    setCookie(
      TIMEZONE_COOKIE_NAME,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      {
        expires: 365 * 24 * 3600,
        path: '/',
      },
    );

    props.resetProgress();
  }

  componentDidMount() {
    setTimeout(() => this.props.completeProgress(), 150);
    this.props.getProject().then(() => {
      if (this.props.project?.telemetry_enabled === '1') {
        analytics.init();
      } else {
        window.analytics = false;
      }
      this.props.incProgress();
    });
  }

  _renderAnalytics = () => {
    return null;
  };

  render() {
    return (
      <BrowserRouter>
        <div className='LoadingBar__wrapper'>
          <LoadingBar
            height={3}
            color='#3B5896'
            progress={this.props.loadProgress}
            className='LoadingBar'
          />
        </div>
        <Header />
        {/*{!isDev() &&*/}
        {/*  <>*/}
        {/*    <AnalyticsPermission />*/}
        {/*    <Helmet>*/}
        {/*      {this._renderAnalytics()}*/}
        {/*    </Helmet>*/}
        {/*  </>*/}
        {/*}*/}
        <ToastProvider portalTargetSelector='#root' autoDismiss>
          <Suspense fallback={null}>
            <Switch>
              <Route
                exact
                path={screens.MAIN}
                component={RedirectFromMainScreen}
              />
              <Route
                key={screens.EXPLORE}
                exact
                path={[screens.EXPLORE, screens.EXPLORE_SEARCH]}
                component={HubMainScreen}
              />
              <Route
                key={screens.EXPLORE_BOOKMARK}
                exact
                path={[
                  screens.EXPLORE_BOOKMARK,
                  screens.EXPLORE_BOOKMARK_SEARCH,
                ]}
                component={HubMainScreen}
              />
              {/*<Route exact path={screens.HUB_PROJECT_EXECUTABLES} component={HubExecutablesScreen}/>*/}
              {/*<Route exact path={screens.HUB_PROJECT_EXECUTABLE_PROCESS_DETAIL} component={HubExecutableProcessDetailScreen}/>*/}
              {/*<Route exact path={screens.HUB_PROJECT_CREATE_EXECUTABLE} component={HubExecutableCreateScreen}/>*/}
              {/*<Route exact path={screens.HUB_PROJECT_EXECUTABLE_DETAIL} component={HubExecutableDetailScreen}/>*/}
              <Route
                exact
                path={screens.HUB_PROJECT_TAGS}
                component={HubTagsScreen}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_CREATE_TAG}
                component={HubTagCreateScreen}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EDIT_TAG}
                component={HubTagDetailScreen}
              />
              <Route
                exact
                path={screens.HUB_TF_SUMMARY_LIST}
                component={HubTFSummaryListScreen}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EXPERIMENT_DASHBOARD}
                component={HubExperimentsDashboardScreen}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EXPERIMENT_DASHBOARD_SEARCH}
                component={HubExperimentsDashboardScreen}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EXPERIMENT_PARAMS_TAB}
                render={(props) => (
                  <HubExperimentScreen {...props} tab='parameters' />
                )}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EXPERIMENT_METRICS_TAB}
                render={(props) => (
                  <HubExperimentScreen {...props} tab='metrics' />
                )}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EXPERIMENT_SYSTEM_TAB}
                render={(props) => (
                  <HubExperimentScreen {...props} tab='system' />
                )}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EXPERIMENT_SETTINGS_TAB}
                render={(props) => (
                  <HubExperimentScreen {...props} tab='settings' />
                )}
              />
              <Route
                exact
                path={screens.HUB_PROJECT_EXPERIMENT}
                render={(props) => (
                  <HubExperimentScreen {...props} tab='parameters' />
                )}
              />
              <Route
                exact
                path={screens.HUB_BOOKMARKS}
                component={HubBookmarksScreen}
              />
              <Route component={SiteNotFoundScreen} />
            </Switch>
          </Suspense>
        </ToastProvider>
      </BrowserRouter>
    );
  }
}

function RedirectFromMainScreen() {
  return <Redirect to={screens.HUB_PROJECT_EXPERIMENT_DASHBOARD} />;
}

export default storeUtils.getWithState(classes.APP, App);
