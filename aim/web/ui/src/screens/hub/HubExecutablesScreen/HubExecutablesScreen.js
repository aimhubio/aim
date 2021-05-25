import './HubExecutablesScreen.less';

import React from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, Link } from 'react-router-dom';

import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import UI from '../../../ui';
import { HUB_PROJECT_CREATE_EXECUTABLE } from '../../../constants/screens';
import * as storeUtils from '../../../storeUtils';
import * as classes from '../../../constants/classes';
import * as screens from '../../../constants/screens';
import RunningExecutablesList from '../../../components/hub/RunningExecutablesList/RunningExecutablesList';
import { buildUrl } from '../../../utils';
import * as analytics from '../../../services/analytics';

class HubExecutablesScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      executables: [],
      execButtons: [],
    };

    this.runningExecsRef = React.createRef();

    props.resetProgress();
  }

  componentDidMount() {
    this.props.incProgress();

    this.props
      .getExecutables()
      .then((data) => {
        this.setState({
          isLoading: false,
          executables: data,
          execButtons: data.map((i) => ({
            loading: false,
            disabled: false,
          })),
        });
      })
      .finally(() => this.props.completeProgress());

    // Analytics
    analytics.pageView('processes');
  }

  handleExecuteBtnClick = (execIdx, executableId) => {
    this.setState((prevState) => {
      let { execButtons } = prevState;
      execButtons[execIdx] = {
        loading: true,
        disabled: true,
      };
      return {
        ...prevState,
        execButtons,
      };
    });

    this.props
      .executeExecutableTemplate(executableId)
      .then(() => {
        this.updateProcesses();
      })
      .finally(() => {
        this.setState((prevState) => {
          let { execButtons } = prevState;
          execButtons[execIdx] = {
            loading: false,
            disabled: false,
          };
          return {
            ...prevState,
            execButtons,
          };
        });
      });
  };

  updateProcesses = () => {
    if (this.runningExecsRef.current) {
      this.runningExecsRef.current.getProcesses();
    }
  };

  _renderContent = () => {
    return (
      <div className='HubExecutablesScreen'>
        <div>
          <UI.Segment
            className='HubExecutablesScreen__processes'
            type='secondary'
          >
            <UI.Text divided>
              Running processes
              <UI.Icon
                className='HubExecutablesScreen__processes__update'
                onClick={() => this.updateProcesses()}
                i='get_app'
              />
            </UI.Text>
            <RunningExecutablesList ref={this.runningExecsRef} />
          </UI.Segment>
          <div className='HubExecutablesScreen__templates'>
            <div className='HubExecutablesScreen__templates__header'>
              <UI.Text size={6}>Process templates</UI.Text>
              <Link to={HUB_PROJECT_CREATE_EXECUTABLE}>
                <UI.Button type='positive'>Create New Template</UI.Button>
              </Link>
            </div>
            {this.state.isLoading ? (
              <UI.Text type='grey' spacingTop center>
                Loading..
              </UI.Text>
            ) : !this.state.executables.length ? (
              <UI.Text type='grey' spacingTop center>
                Empty
              </UI.Text>
            ) : (
              <UI.List>
                {this.state.executables.map((e, eKey) => (
                  <UI.ListItem
                    key={eKey}
                    className='HubExecutablesScreen__item'
                  >
                    <Link
                      to={buildUrl(screens.HUB_PROJECT_EXECUTABLE_DETAIL, {
                        executable_id: e.id,
                      })}
                    >
                      {e.name}
                    </Link>
                    <div className='HubExecutablesScreen__item__cmd'>
                      <UI.Button
                        className='HubExecutablesScreen__item__cmd__btn'
                        type='secondary'
                        size='tiny'
                        onClick={() => this.handleExecuteBtnClick(eKey, e.id)}
                        {...this.state.execButtons[eKey]}
                      >
                        Execute with default params
                      </UI.Button>
                      <UI.Text inline type='grey-dark'>
                        > {e.script_path}
                      </UI.Text>
                    </div>
                    <UI.Text small type='grey'>
                      Interpreter:{' '}
                      {e.interpreter_path ? e.interpreter_path : 'python'}
                    </UI.Text>
                    <UI.Text small type='grey'>
                      Workspace: {e.working_dir}
                    </UI.Text>
                  </UI.ListItem>
                ))}
              </UI.List>
            )}
          </div>
        </div>
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

export default storeUtils.getWithState(
  classes.HUB_PROJECT_EXECUTABLES,
  HubExecutablesScreen,
);
