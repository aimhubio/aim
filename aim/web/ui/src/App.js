import './App.less';

import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';

import * as screens from './constants/screens';
import * as classes from './constants/classes';
import * as storeUtils from './storeUtils';
import * as analytics from './services/analytics';
import HubExperimentScreen from './screens/hub/HubExperimentScreen/HubExperimentScreen';
import SiteNotFoundScreen from './screens/site/SiteNotFoundScreen/SiteNotFoundScreen';
import Header from './components/global/Header/Header';
import HubMainScreen from './screens/hub/HubMainScreen/HubMainScreen';
import HubExecutablesScreen from './screens/hub/HubExecutablesScreen/HubExecutablesScreen';
import HubExecutableCreateScreen from './screens/hub/HubExecutableCreateScreen/HubExecutableCreateScreen';
import HubExecutableDetailScreen from './screens/hub/HubExecutableDetailScreen/HubExecutableDetailScreen';
import HubExecutableProcessDetailScreen from './screens/hub/HubExecutableProcessDetailScreen/HubExecutableProcessDetailScreen';
import HubTagsScreen from './screens/hub/HubTagsScreen/HubTagsScreen';
import HubTagCreateScreen from './screens/hub/HubTagCreateScreen/HubTagCreateScreen';
import HubTagDetailScreen from './screens/hub/HubTagDetailScreen/HubTagDetailScreen';
import HubTFSummaryListScreen from './screens/hub/HubTFSummaryListScreen/HubTFSummaryListScreen';
import HubExperimentsDashboardScreen from './screens/hub/HubExperimentsDashboardScreen/HubExperimentsDashboardScreen';
import { setCookie } from './services/cookie';
import { TIMEZONE_COOKIE_NAME } from './config';

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
        <Switch>
          <Route exact path={screens.MAIN} component={RedirectFromMainScreen} />
          <Route
            exact
            path={[
              screens.EXPLORE,
              screens.EXPLORE_BOOKMARK,
              screens.EXPLORE_SEARCH,
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
            render={(props) => <HubExperimentScreen {...props} tab='metrics' />}
          />
          <Route
            exact
            path={screens.HUB_PROJECT_EXPERIMENT_SYSTEM_TAB}
            render={(props) => <HubExperimentScreen {...props} tab='system' />}
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
          <Route component={SiteNotFoundScreen} />
        </Switch>
      </BrowserRouter>
    );
  }
}

function RedirectFromMainScreen() {
  return <Redirect to={screens.HUB_PROJECT_EXPERIMENT_DASHBOARD} />;
}

export default storeUtils.getWithState(classes.APP, App);
