import './HubExecutableCreateScreen.less';

import React from 'react';
import { Link, Redirect } from 'react-router-dom';

import UI from '../../../ui';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import * as storeUtils from '../../../storeUtils';
import ExecutableViewForm from '../../../components/hub/ExecutableViewForm/ExecutableViewForm';

class HubExecutableCreateScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirectMain: false,
      createBtn: {
        loading: false,
        disabled: false,
      },
      executeBtn: {
        loading: false,
        disabled: false,
      },
    };

    this.form = React.createRef();
  }

  handleCreateBtnClick = () => {
    if (!this.form) {
      return;
    }
    const form = this.form.current.getForm();

    this.setState({
      createBtn: {
        loading: true,
        disabled: true,
      },
    });
    this.props
      .createExecutable({
        name: form.name,
        script_path: form.scriptPath,
        arguments: form.parameter,
        env_vars: form.environmentVariable,
        interpreter_path: form.interpreterPath,
        working_dir: form.workingDir,
        aim_experiment: form.aimExperiment,
      })
      .then((data) => {
        this.setState((prevState) => ({
          ...prevState,
          redirectMain: true,
        }));
      })
      .catch((err) => {})
      .finally(() => {
        this.setState((prevState) => ({
          ...prevState,
          createBtn: {
            loading: false,
            disabled: false,
          },
        }));
      });
  };

  handleExecuteBtnClick = () => {
    if (!this.form) {
      return;
    }
    const form = this.form.current.getForm();

    this.setState((prevState) => ({
      ...prevState,
      executeBtn: {
        ...prevState.executeBtn,
        loading: true,
        disabled: true,
      },
    }));

    this.props
      .executeExecutable({
        name: form.name,
        script_path: form.scriptPath,
        arguments: form.parameter,
        env_vars: form.environmentVariable,
        interpreter_path: form.interpreterPath,
        working_dir: form.workingDir,
        aim_experiment: form.aimExperiment,
      })
      .then(() => {
        this.setState((prevState) => ({
          ...prevState,
          redirectMain: true,
        }));
      })
      .finally(() => {
        this.setState((prevState) => ({
          ...prevState,
          executeBtn: {
            ...prevState.executeBtn,
            loading: false,
            disabled: false,
          },
        }));
      });
  };

  _renderContent = () => {
    return (
      <div className='HubExecutableCreateScreen__FormGroup__wrapper'>
        <UI.Text size={6} header divided>
          {' '}
          Create Process Template{' '}
        </UI.Text>
        <ExecutableViewForm ref={this.form} />
        <UI.Buttons>
          <UI.Button
            onClick={() => this.handleCreateBtnClick()}
            type='positive'
            {...this.state.createBtn}
          >
            Save as template
          </UI.Button>
          {/*<UI.Button*/}
          {/*  onClick={() => this.handleExecuteBtnClick()}*/}
          {/*  type='primary'*/}
          {/*  {...this.state.executeBtn}*/}
          {/*>*/}
          {/*  Execute now*/}
          {/*</UI.Button>*/}
          <Link to={screens.HUB_PROJECT_EXECUTABLES}>
            <UI.Button type='secondary'> Cancel </UI.Button>
          </Link>
        </UI.Buttons>
      </div>
    );
  };

  render() {
    if (this.state.redirectMain) {
      return <Redirect to={screens.HUB_PROJECT_EXECUTABLES} push />;
    }

    return (
      <ProjectWrapper>
        <UI.Container size='small'>{this._renderContent()}</UI.Container>
      </ProjectWrapper>
    );
  }
}

export default storeUtils.getWithState(
  classes.HUB_PROJECT_CREATE_EXECUTABLE,
  HubExecutableCreateScreen,
);
