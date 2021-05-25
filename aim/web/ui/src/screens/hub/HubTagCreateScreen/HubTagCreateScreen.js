import './HubTagCreateScreen.less';

import React from 'react';
import { Redirect } from 'react-router-dom';

import UI from '../../../ui';
import TagSettingForm from '../../../components/hub/TagSettingForm/TagSettingForm';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import * as storeUtils from '../../../storeUtils';
import { Link } from 'react-router-dom';
import * as analytics from '../../../services/analytics';

class HubTagCreateScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldRedirect: false,
      buttonStatus: {
        loading: false,
        disabled: false,
      },
    };

    this.form = React.createRef();
  }

  componentDidMount() {
    analytics.pageView('Tag create');
  }

  handleCreateClick = () => {
    this.setState({
      buttonStatus: {
        loading: true,
        disabled: true,
      },
    });

    const form = this.form.current.getForm();

    this.props
      .postNewTag(form)
      .then((data) => {
        this.setState((prevState) => ({
          ...prevState,
          shouldRedirect: true,
        }));
        analytics.trackEvent('[Tags] Create a tag');
      })
      .catch((err) => {})
      .finally(() => {
        this.setState((prevState) => ({
          ...prevState,
          buttonStatus: {
            loading: false,
            disabled: false,
          },
        }));
      });
  };

  _renderContent = () => {
    return (
      <div className='HubTagCreateScreen__FormGroup__wrapper'>
        <UI.Text size={6} header divided>
          Create New Tag
        </UI.Text>
        <TagSettingForm ref={this.form} />
        <UI.Line />
        <UI.Buttons>
          <UI.Button
            onClick={() => this.handleCreateClick()}
            type='positive'
            {...this.state.buttonStatus}
          >
            Create
          </UI.Button>
          <Link to={screens.HUB_PROJECT_TAGS}>
            <UI.Button type='secondary'> Cancel </UI.Button>
          </Link>
        </UI.Buttons>
      </div>
    );
  };

  render() {
    if (this.state.shouldRedirect) {
      return <Redirect to={screens.HUB_PROJECT_TAGS} push />;
    }

    return (
      <ProjectWrapper>
        <UI.Container size='small'>{this._renderContent()}</UI.Container>
      </ProjectWrapper>
    );
  }
}

export default storeUtils.getWithState(
  classes.HUB_PROJECT_CREATE_TAG,
  HubTagCreateScreen,
);
