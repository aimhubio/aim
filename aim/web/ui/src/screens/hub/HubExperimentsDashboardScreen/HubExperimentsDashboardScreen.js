import './HubExperimentsDashboardScreen.less';

import React from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';

import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import * as analytics from '../../../services/analytics';
import * as storeUtils from '../../../storeUtils';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import { buildUrl } from '../../../utils';
import Activity from './components/Activity/Activity';
import Runs from './components/Runs/Runs';

class HubExperimentsDashboardScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchQuery: null,
    };

    this.initSearchQuery = '';

    this.runsRef = React.createRef();

    props.resetProgress();
  }

  componentDidMount() {
    this.props.completeProgress();

    this.recoverStateFromURL(window.location.search);

    // Analytics
    analytics.pageView('Dashboard');
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.location !== prevProps.location) {
      this.recoverStateFromURL(location.search);
    }
  }

  recoverStateFromURL = (search) => {
    if (!!search && search.indexOf('?search=') !== -1) {
      if (!this.isURLStateOutdated(search)) {
        return;
      }

      const state = this.URLSearchToState(search);
      const searchKey = state?.searchKey ?? '';
      this.initSearchQuery = searchKey;
      this.setRunsSearchBarValue(searchKey, false);
      this.setState({
        searchQuery: searchKey,
      });
    } else {
      this.setRunsSearchBarValue('', false);
      this.setState({
        searchQuery: '',
      });
    }
  };

  stateToURL = (state) => {
    const encodedState = btoa(JSON.stringify(state));
    const URL = buildUrl(screens.HUB_PROJECT_EXPERIMENT_DASHBOARD_SEARCH, {
      search: encodedState,
    });
    return URL;
  };

  URLSearchToState = (search) => {
    if (search.indexOf('?search=') !== -1) {
      try {
        const encodedState = search.substr(8);
        return JSON.parse(atob(encodedState));
      } catch (e) {
        console.log(e);
        return null;
      }
    }
    return null;
  };

  isURLStateOutdated = (searchQuery) => {
    const state = this.URLSearchToState(searchQuery);
    if (state === null) {
      return !(!!searchQuery && searchQuery.indexOf('?search=') !== -1);
    }

    if (this.getRunsSearchBarValue() !== state.searchKey) {
      return true;
    }

    return false;
  };

  updateURL = () => {
    const state = {
      searchKey: this.getRunsSearchBarValue(),
    };

    const URL = this.stateToURL(state);
    if (this.props.location.pathname + this.props.location.search !== URL) {
      this.props.history.push(URL);
    }
  };

  setRunsSearchBarValue = (val, submit = true) => {
    const searchBarRef = this.runsRef?.current?.searchBarRef?.current;
    if (!!searchBarRef) {
      searchBarRef.setValue(val, submit);
    } else {
      setTimeout(() => this.setRunsSearchBarValue(val, submit), 20);
    }
  };

  getRunsSearchBarValue = () => {
    return this.runsRef?.current?.searchBarRef?.current?.getValue();
  };

  _renderContent = () => {
    return (
      <div className='HubExperimentsDashboardScreen'>
        <div className='HubExperimentsDashboardScreen__content'>
          <div className='HubExperimentsDashboardScreen__content__block HubExperimentsDashboardScreen__content__block--activity'>
            <Activity setRunsSearchBarValue={this.setRunsSearchBarValue} />
          </div>
          <div className='HubExperimentsDashboardScreen__content__block'>
            <Runs
              ref={this.runsRef}
              searchQuery={this.state.searchQuery ?? this.initSearchQuery}
              updateURL={this.updateURL}
            />
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <ProjectWrapper size='fluid' gap={false}>
        <Helmet>
          <meta title='' content='' />
        </Helmet>

        {this._renderContent()}
      </ProjectWrapper>
    );
  }
}

export default withRouter(
  storeUtils.getWithState(
    classes.HUB_PROJECT_EXPERIMENTS_DASHBOARD_SCREEN,
    HubExperimentsDashboardScreen,
  ),
);
