import './HubExecutableProcessDetailScreen.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as storeUtils from '../../../storeUtils';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import UI from '../../../ui';
import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import { Link } from 'react-router-dom';
import { buildUrl } from '../../../utils';
import moment from 'moment';

class HubExecutableProcessDetailScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      process: {},
    };
  }

  componentDidMount() {
    const procID = this.props.match.params.process_id;
    this.props
      .getExecutableProcess(procID)
      .then((data) => {
        this.setState((prevState) => ({
          ...prevState,
          process: data,
        }));
      })
      .finally(() => {
        this.setState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      });
  }

  _renderContent = () => {
    if (this.state.isLoading) {
      return (
        <UI.Text type='grey' center>
          Loading..
        </UI.Text>
      );
    }

    return (
      <div>
        <UI.Text
          className='HubExecutableProcessDetailScreen__name'
          size={6}
          header
        >
          <Link to={buildUrl(screens.HUB_PROJECT_EXECUTABLES, {})}>
            Processes
          </Link>
          <UI.Text type='grey' inline>
            {' '}
            /{' '}
          </UI.Text>
          <Link
            to={buildUrl(screens.HUB_PROJECT_EXECUTABLE_DETAIL, {
              executable_id: this.state.process.executable.id,
            })}
          >
            {this.state.process.executable.name}
          </Link>
          <UI.Text type='grey' inline>
            {' '}
            / pid: {this.state.process.pid}{' '}
          </UI.Text>
        </UI.Text>
        <UI.Segment className='HubExecutableProcessDetailScreen__process'>
          {/*<UI.Text small>{moment.format(this.state.process.created_at, 'HH:mm · D MMM, YY')}</UI.Text>*/}
          <UI.Text>
            Environment Variables:{' '}
            {!!this.state.process.env_vars
              ? this.state.process.env_vars
              : 'N/A'}
          </UI.Text>
          <UI.Text>Script: {this.state.process.script_path}</UI.Text>
          <UI.Text>
            Arguments:{' '}
            {!!this.state.process.arguments
              ? this.state.process.arguments
              : 'N/A'}
          </UI.Text>
          <UI.Line />
          {!!this.state.process.interpreter_path && (
            <UI.Text>
              Interpreter: {this.state.process.interpreter_path}
            </UI.Text>
          )}
          <UI.Text>Working Directory: {this.state.process.working_dir}</UI.Text>
          <UI.Line />
          <UI.Text>
            Aim Experiment:{' '}
            {!!this.state.process.aim_experiment
              ? this.state.process.aim_experiment
              : 'N/A'}
          </UI.Text>
        </UI.Segment>
      </div>
    );
  };

  render() {
    return (
      <ProjectWrapper>
        <UI.Container size='small'>{this._renderContent()}</UI.Container>
      </ProjectWrapper>
    );
  }
}

HubExecutableProcessDetailScreen.propTypes = {};

export default storeUtils.getWithState(
  classes.HUB_PROJECT_EXECUTABLE_PROCESS_DETAIL,
  HubExecutableProcessDetailScreen,
);
