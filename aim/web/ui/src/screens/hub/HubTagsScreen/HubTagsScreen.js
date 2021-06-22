import './HubTagsScreen.less';

import React from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, Link } from 'react-router-dom';

import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import UI from '../../../ui';
import * as storeUtils from '../../../storeUtils';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import { buildUrl } from '../../../utils';
import * as analytics from '../../../services/analytics';

class HubTagsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tags: [],
    };

    props.resetProgress();
  }

  componentDidMount() {
    this.props.incProgress();

    this.getTags(this.props.completeProgress);

    // Analytics
    analytics.pageView('Tags');
  }

  getTags = (finallyCallback) => {
    this.setState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    this.props
      .getTags()
      .then((data) => {
        this.setState((prevState) => ({
          ...prevState,
          tags: data,
        }));
      })
      .finally(() => {
        this.setState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));

        if (finallyCallback) {
          finallyCallback();
        }
      });
  };

  _renderContent = () => {
    if (this.state.isLoading) {
      return (
        <UI.Text type='grey' center>
          Loading..
        </UI.Text>
      );
    }

    return (
      <div className='HubTagsScreen'>
        <div className='HubTagsScreen__header'>
          <UI.Text size={6}>Tags List</UI.Text>
          <Link to={screens.HUB_PROJECT_CREATE_TAG}>
            <UI.Button type='positive'>New Tag</UI.Button>
          </Link>
        </div>
        {!!this.state.tags && (
          <UI.List>
            {this.state.tags.map((tag, tagKey) => (
              <UI.ListItem key={tagKey} className='HubTagsScreen__tags__item'>
                <Link
                  to={buildUrl(screens.HUB_PROJECT_EDIT_TAG, {
                    tag_id: tag.id,
                  })}
                >
                  <div className='HubTagsScreen__tags__item__body'>
                    <UI.Label color={tag.color}>{tag.name}</UI.Label>
                    <UI.Text
                      className='HubTagsScreen__tags__item__commits'
                      small
                      inline
                      type='grey'
                    >
                      Runs: {tag.num_commits}
                    </UI.Text>
                  </div>
                </Link>
              </UI.ListItem>
            ))}
          </UI.List>
        )}
        {(!this.state.tags || this.state.tags.length === 0) && (
          <UI.Text type='grey' center>
            Empty
          </UI.Text>
        )}
      </div>
    );
  };

  render() {
    return (
      <ProjectWrapper>
        <Helmet>
          <meta title='' content='' />
        </Helmet>

        <UI.Container size='small'>{this._renderContent()}</UI.Container>
      </ProjectWrapper>
    );
  }
}

export default storeUtils.getWithState(classes.HUB_PROJECT_TAGS, HubTagsScreen);
