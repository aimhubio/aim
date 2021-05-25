import './HubExperimentScreen.less';
import './ExperimentDiff.css';

import React from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, Link, withRouter } from 'react-router-dom';
import ReactSVG from 'react-svg';
import { parseDiff, Diff, Hunk, Decoration } from 'react-diff-view';
import moment from 'moment';
import ReactJson from 'react-json-view';

import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import ExperimentCell from '../../../components/hub/ExperimentCell/ExperimentCell';
import * as classes from '../../../constants/classes';
import * as storeUtils from '../../../storeUtils';
import UI from '../../../ui';
import {
  buildUrl,
  classNames,
  formatDuration,
  formatSize,
  formatSystemMetricName,
  rightStrip,
} from '../../../utils';
import { SERVER_HOST, SERVER_API_HOST, WS_HOST } from '../../../config';
import * as screens from '../../../constants/screens';
import CommitNavigation from '../../../components/hub/CommitNavigation/CommitNavigation';
import IncompatibleVersion from '../../../components/global/IncompatibleVersion/IncompatibleVersion';
import CurrentRunIndicator from '../../../components/hub/CurrentRunIndicator/CurrentRunIndicator';
import * as analytics from '../../../services/analytics';
import DangerZone from '../../../components/hub/DangerZone/DangerZone';

class HubExperimentScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      notFound: false,
      versionError: false,
      experiment: null,
      selectedModel: false,
      selectBranch: null,
      commits: [],
      commit: {},
      contentWidth: null,
      metricsData: {},
      tags: [],
      tagsAreLoading: true,
      activeTab: props.tab,
      archivationBtn: {
        loading: false,
        disabled: false,
      },
    };

    this.contentRef = React.createRef();

    this.WSClient = null;
    // Tabs, first tab is the default one
    this.tabs = ['parameters', 'metrics', 'system', 'settings'];

    props.resetProgress();
  }

  componentDidMount() {
    this.getExperiment();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    // Analytics
    analytics.pageView('Experiment detail');
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      const currentPath = rightStrip(this.props.location.pathname, '/');
      const prevPath = rightStrip(prevProps.location.pathname, '/');
      const currentPathSplit = currentPath.split('/');

      let currentHash = currentPath;
      let prevHash = prevPath;
      this.tabs.forEach((tab) => {
        currentHash = rightStrip(currentHash, tab);
        prevHash = rightStrip(prevHash, tab);
      });
      currentHash = rightStrip(currentHash, '/');
      prevHash = rightStrip(prevHash, '/');

      let currentTab = this.tabs[0];
      if (
        !!currentPathSplit &&
        currentPathSplit.length &&
        this.tabs.indexOf(currentPathSplit[currentPathSplit.length - 1]) !== -1
      ) {
        currentTab = currentPathSplit[currentPathSplit.length - 1];
      }

      if (currentHash !== prevHash) {
        // Navigate to another experiment
        this.WSClose();
        this.setState(
          {
            isLoading: true,
            notFound: false,
            experiment: null,
            annotations: null,
            expandCluster: {},
            selectedModel: false,
            selectBranch: null,
            tags: [],
            activeTab: currentTab,
          },
          () => {
            this.getExperiment();
          },
        );
      } else {
        // Navigate to another tab
        this.setState({
          activeTab: currentTab,
        });
      }
    }

    if (prevState.activeTab !== this.state.activeTab) {
      const currentPath = rightStrip(this.props.location.pathname, '/');
      if (currentPath.endsWith(this.state.activeTab)) {
        return;
      }

      let currentHash = currentPath;
      this.tabs.forEach((tab) => {
        currentHash = rightStrip(currentHash, tab);
      });
      currentHash = rightStrip(currentHash, '/');

      this.props.history.push(`${currentHash}/${this.state.activeTab}`);
    }
  }

  getTags = () => {
    this.setState((prevState) => ({
      ...prevState,
      tagsAreLoading: true,
    }));

    this.props
      .getCommitTags(this.state.commit?.hash)
      .then((data) => {
        this.setState({
          tags: data,
        });
      })
      .catch((err) => {})
      .finally(() => {
        this.setState((prevState) => ({
          ...prevState,
          tagsAreLoading: false,
        }));
      });
  };

  onIndex = () => {
    return false;
  };

  WSOpen = () => {
    if (!this.WSClient && this.onIndex()) {
      this.WSClient = new WebSocket(`${WS_HOST}/insight`);
      this.WSClient.onopen = this.WSOnOpen;
      this.WSClient.onerror = this.WSOnError;
      this.WSClient.onmessage = this.WSOnMessage;
    }
  };

  WSClose = () => {
    if (this.WSClient) {
      this.WSClient.close();
      this.WSClient = null;
    }
  };

  WSOnOpen = () => {
    // Connection is opened
  };

  WSEncodeInsight = (data) => {
    const dataComplete = Object.assign(
      {
        branch: this.props.match.params.experiment_name,
      },
      data,
    );

    const dataJson = JSON.stringify(dataComplete);
    const dataHash = btoa(dataJson);
    return dataHash;
  };

  WSDecodeInsight = (dataHash) => {
    const dataJson = atob(dataHash);
    const data = JSON.parse(dataJson);
    return data;
  };

  WSOnError = () => {
    this.WSClient = null;
    setTimeout(() => this.WSOpen(), 1000);
  };

  WSSendMsg = (msg, wait = false) => {
    const jsonMsg = JSON.stringify(msg);

    if (this.WSClient && this.WSClient.readyState === WebSocket.OPEN) {
      this.WSClient.send(jsonMsg);
    } else {
      if (wait) {
        setTimeout(() => this.WSSendMsg(msg, wait), 50);
      }
    }
  };

  WSSubscribeToInsightUpdates = (insightHash) => {
    this.WSSendMsg(
      {
        event: 'subscribe',
        data: insightHash,
      },
      true,
    );
  };

  WSUnsubscribeFromInsightUpdates = (insightHash) => {
    this.WSSendMsg(
      {
        event: 'unsubscribe',
        data: insightHash,
      },
      true,
    );
  };

  WSOnMessage = (WSMsg) => {
    const msg = JSON.parse(WSMsg.data);

    switch (msg.event) {
      case 'insight_update':
        this.WSOnInsightUpdate(msg.header, msg.data);
        break;
    }
  };

  WSOnInsightUpdate = (header, data) => {
    header = this.WSDecodeInsight(header);

    switch (header.insight) {
      case 'stat':
        this.updateStat(header.name, JSON.parse(data));
        break;
      case 'metric':
        this.updateMetric(header.name, data);
        break;
    }
  };

  statSubscribeToUpdates = (statName, resourceName) => {
    const insightHash = this.WSEncodeInsight({
      insight: 'stat',
      name: statName,
      resource: resourceName,
      file_path: `dirs/${statName}/${resourceName}.log`,
    });

    this.WSSubscribeToInsightUpdates(insightHash);
  };

  statUnsubscribeFromUpdates = (statName, resourceName) => {
    const insightHash = this.WSEncodeInsight({
      insight: 'stat',
      name: statName,
      resource: resourceName,
      file_path: `dirs/${statName}/${resourceName}.log`,
    });

    this.WSUnsubscribeFromInsightUpdates(insightHash);
  };

  metricSubscribeToUpdates = (metricName, format) => {
    const insightHash = this.WSEncodeInsight({
      insight: 'metric',
      name: metricName,
      format: format,
      file_path: `metrics/${metricName}.log`,
    });

    this.WSSubscribeToInsightUpdates(insightHash);
  };

  metricUnsubscribeFromUpdates = (metricName) => {
    const insightHash = this.WSEncodeInsight({
      insight: 'metric',
      name: metricName,
      file_path: `metrics/${metricName}.log`,
    });

    this.WSUnsubscribeFromInsightUpdates(insightHash);
  };

  updateMetric = (metricName, data) => {
    if (isNaN(data)) {
      return;
    }

    data = parseFloat(data);

    this.setState((prevState) => {
      let { metricsData } = prevState;

      let updatedData = [];
      if (metricsData[metricName].data && metricsData[metricName].data.length) {
        updatedData = [...metricsData[metricName].data];
      }
      updatedData.push(data);

      metricsData = Object.assign({}, metricsData, {
        [metricName]: Object.assign({}, metricsData[metricName], {
          data: updatedData,
          rerender: false,
        }),
      });

      return {
        ...prevState,
        metricsData,
      };
    });
  };

  handleResize = () => {
    if (!this.contentRef.current) {
      setTimeout(() => this.handleResize(), 50);
      return;
    }

    const width = this.contentRef.current.containerRef.current.offsetWidth;

    this.setState((prevState) => {
      return {
        ...prevState,
        contentWidth: width,
      };
    });
  };

  getExperiment = () => {
    this.props.incProgress();

    let experimentName = this.props.match.params.experiment_name,
      commitId = this.props.match.params.commit_id;

    this.props
      .getExperiment(experimentName, commitId)
      .then((data) => {
        if (data.maps && Array.isArray(data.maps)) {
          data.maps.forEach((m) => {
            if ('__METRICS__' in m.data) {
              delete m.data['__METRICS__'];
            }
          });
        }

        let annotations = {};
        if (data.annotations) {
          data.annotations.forEach((annotationItem) => {
            let annotationCluster = {};
            annotationItem.data.forEach((item) => {
              let predLabel = item.meta.label;
              if (!(predLabel in annotationCluster)) {
                annotationCluster[predLabel] = [];
              }
              annotationCluster[predLabel].push(item);
            });
            annotations[annotationItem.name] = annotationCluster;
          });
        }

        this.props.incProgress();

        this.setState(
          (prevState) => {
            return {
              ...prevState,
              experiment: data,
              annotations: annotations,
              commits: data.commits ? Object.values(data.commits) : [],
              commit: data.commit ? data.commit : null,
              selectedModel: !!data.models ? data.models[0] : false,
            };
          },
          () => {
            this.getTags();
            // if (data.metrics) {
            //   const metricsData = {};
            //   data.metrics.forEach((item) => {
            //     metricsData[item.name] = {
            //       data: item.data,
            //       rerender: true,
            //     };
            //     this.metricSubscribeToUpdates(item.name, item.format);
            //   });
            //   this.setState({ metricsData });
            // }
          },
        );
      })
      .catch((err) => {
        if (err.status === 501) {
          this.setState({
            versionError: true,
          });
        } else if (err.status === 404 || err.status === 500) {
          this.setState({
            notFound: true,
          });
        }
      })
      .finally(() => {
        this.setState((prevState) => {
          return {
            ...prevState,
            isLoading: false,
          };
        });

        setTimeout(() => this.props.completeProgress(), 300);
      });
  };

  handleModelOpen = (model) => {
    this.setState({
      selectedModel: model,
    });
  };

  handleBranchChange = (v, { action }) => {
    let experimentName = this.props.match.params.experiment_name;

    if (action === 'select-option' && v.value !== experimentName) {
      this.setState({
        selectBranch: v.value,
      });
    }
  };

  handleArchivationBtnClick = () => {
    const experimentName = this.props.match.params.experiment_name;
    const runHash = this.state.commit.hash;

    this.setState({
      archivationBtn: {
        loading: true,
        disabled: true,
      },
    });

    this.props
      .updateCommitArchivationFlag(experimentName, runHash)
      .then((data) => {
        this.setState((prevState) => ({
          ...prevState,
          commit: {
            ...prevState.commit,
            archived: data.archived,
          },
        }));
      })
      .finally(() => {
        this.setState({
          archivationBtn: {
            loading: false,
            disabled: false,
          },
        });
      });
  };

  _formatFileSize = (size) => {
    let formatted = formatSize(size);
    return `${formatted[0]}${formatted[1]}`;
  };

  _renderMetric = (metric, key) => {
    let name = metric.name;

    if (name.startsWith('__system__')) {
      name = formatSystemMetricName(metric.name);
    }

    return (
      <>
        {metric.traces.map((trace, traceKey) => (
          <ExperimentCell
            header='metric'
            footerTitle={name}
            footerLabels={
              !!trace.context
                ? Object.keys(trace.context).map(
                  (c) => `${c}: ${trace.context[c]}`,
                )
                : []
            }
            key={`${key * 10 + 5}-${traceKey}`}
          >
            <UI.LineChart
              header={metric.name}
              data={trace.data}
              xAxisFormat='step'
              smooth={false}
            />
          </ExperimentCell>
        ))}
      </>
    );
  };

  _renderExperimentHeader = () => {
    let experimentName = this.props.match.params.experiment_name;

    let processDuration = null;
    if (!!this.state.commit?.process?.time) {
      processDuration = formatDuration(this.state.commit.process.time);
    }

    return (
      <>
        {!!this.props.project.branches && !!this.props.project.branches.length && (
          <div className='HubExperimentScreen__header'>
            <div className='HubExperimentScreen__header__top'>
              <UI.Dropdown
                className='HubExperimentScreen__branchSelect'
                width={200}
                options={
                  this.props.project.branches &&
                  this.props.project.branches.map((val) => ({
                    value: val,
                    label: `${val}`,
                  }))
                }
                defaultValue={{
                  value: experimentName,
                  label: `${experimentName}`,
                }}
                onChange={this.handleBranchChange}
              />
              <div>
                {!!this.state.commit && (
                  <div className='HubExperimentScreen__header__content'>
                    <div className='HubExperimentScreen__header__content__process'>
                      {this.state.commit?.process?.finish === false && (
                        <CurrentRunIndicator />
                      )}
                      {!!this.state.commit?.process && (
                        <div>
                          {!!this.state.commit.process.start_date && (
                            <UI.Text type='grey' small>
                              {!!this.state.commit.process.uuid ? (
                                <Link
                                  to={buildUrl(
                                    screens.HUB_PROJECT_EXECUTABLE_PROCESS_DETAIL,
                                    {
                                      process_id:
                                        this.state.commit.process.uuid,
                                    },
                                  )}
                                >
                                  Process
                                </Link>
                              ) : (
                                <UI.Text inline>Process</UI.Text>
                              )}{' '}
                              started at{' '}
                              {moment
                                .unix(this.state.commit.process.start_date)
                                .format('HH:mm:ss · D MMM, YY')}
                            </UI.Text>
                          )}
                          {!!processDuration && (
                            <UI.Text type='grey' small>
                              Execution Time:
                              {` ${processDuration.hours}h ${processDuration.minutes}m ${processDuration.seconds}s`}
                            </UI.Text>
                          )}
                        </div>
                      )}
                    </div>
                    {!!this.state.tags?.length && (
                      <div className='HubExperimentScreen__header__tags'>
                        {!this.state.tagsAreLoading &&
                          this.state.tags.length > 0 && (
                          <Link
                            to={buildUrl(screens.HUB_PROJECT_EDIT_TAG, {
                              tag_id: this.state.tags[0].id,
                            })}
                          >
                            <UI.Label
                              key={this.state.tags[0].id}
                              color={this.state.tags[0].color}
                            >
                              {this.state.tags[0].name}
                            </UI.Label>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  _renderEmptyBranch = (exist = true) => {
    let experimentName = this.props.match.params.experiment_name;

    return (
      <>
        {this._renderExperimentHeader()}
        <div className='HubExperimentScreen__empty'>
          <ReactSVG
            className='HubExperimentScreen__empty__illustration'
            src={require('../../../asset/illustrations/no_data.svg')}
          />
          <UI.Text size={6} type='grey-light' center>
            {!exist
              ? `Experiment "${experimentName}" does not exist`
              : `Experiment "${experimentName}" is empty`}
          </UI.Text>
        </div>
      </>
    );
  };

  _renderEmptyIndex = () => {
    return (
      <>
        {this._renderExperimentHeader()}
        <div className='HubExperimentScreen__empty'>
          <ReactSVG
            className='HubExperimentScreen__empty__illustration'
            src={require('../../../asset/illustrations/no_data.svg')}
          />
          <UI.Text size={6} type='grey-light' center>
            Nothing to show — empty run
          </UI.Text>
        </div>
      </>
    );
  };

  _renderNavigation = () => {
    if (
      !this.state.experiment?.branch_init ||
      this.state.experiment?.branch_empty
    ) {
      return null;
    }

    const experimentName = this.props.match.params.experiment_name;

    return (
      <CommitNavigation
        commits={this.state.commits}
        active={this.state.commit?.hash}
        experimentName={experimentName}
      />
    );
  };

  _renderParameters = () => {
    if (
      !this.state.experiment?.maps?.filter(
        (m) => m.data && Object.keys(m.data).length,
      ).length
    ) {
      return (
        <UI.Text type='grey' center>
          No logged parameters
        </UI.Text>
      );
    }

    const maps = [];
    this.state.experiment.maps.forEach((mapItem, mapKey) => {
      if (mapItem.nested) {
        Object.keys(mapItem.data).forEach((mapItemKeyName, mapItemKey) => {
          maps.push({
            name: mapItemKeyName,
            data: mapItem.data[mapItemKeyName],
          });
        });
      } else {
        maps.push({
          name: mapKey,
          data: mapItem,
        });
      }
    });

    return (
      <div className='HubExperimentScreen__grid'>
        <div className='HubExperimentScreen__grid__wrapper'>
          {maps.map((i, k) => (
            <ExperimentCell header={i.name} height='auto' width={2}>
              <div className='ExperimentParams ExperimentParams--tree' key={k}>
                <ReactJson name={false} theme='bright:inverted' src={i.data} />
              </div>
            </ExperimentCell>
          ))}
        </div>
      </div>
    );
  };

  _renderMetrics = () => {
    const metrics = this.state.experiment?.metrics?.filter(
      (m) => !m?.name?.startsWith('__system__'),
    );

    if (!metrics || !metrics.length) {
      return (
        <UI.Text type='grey' center>
          No tracked metrics
        </UI.Text>
      );
    }

    return (
      <div className='HubExperimentScreen__grid'>
        <div className='HubExperimentScreen__grid__wrapper'>
          {metrics.map((item, key) => this._renderMetric(item, key))}
        </div>
      </div>
    );
  };

  _renderSystemMetrics = () => {
    const metrics = this.state.experiment?.metrics?.filter((m) =>
      m?.name?.startsWith('__system__'),
    );

    if (!metrics || !metrics.length) {
      return (
        <UI.Text type='grey' center>
          No tracked system metrics
        </UI.Text>
      );
    }

    return (
      <div className='HubExperimentScreen__grid'>
        <div className='HubExperimentScreen__grid__wrapper'>
          {metrics.map((item, key) => this._renderMetric(item, key))}
        </div>
      </div>
    );
  };

  _renderSettings = () => {
    return (
      <div>
        <UI.Segment type='negative'>
          {this.state.commit.archived && (
            <UI.Text type='grey-dark' spacing>
              This run is archived.
            </UI.Text>
          )}
          <UI.Button
            type={this.state.commit.archived ? 'secondary' : 'negative'}
            onClick={() => this.handleArchivationBtnClick()}
            {...this.state.archivationBtn}
          >
            {this.state.commit.archived ? 'Unarchive' : 'Archive this run'}
          </UI.Button>
          {!this.state.commit.archived && (
            <UI.Text type='grey-dark' spacingTop>
              Archived runs will not appear in search both on Dashboard and
              Explore.
            </UI.Text>
          )}
        </UI.Segment>
      </div>
    );
  };

  _renderContent = () => {
    if (this.state.versionError) {
      return <IncompatibleVersion />;
    }

    if (!this.state.experiment || !this.state.experiment.branch_init) {
      return this._renderEmptyBranch(false);
    }

    if (this.state.experiment.branch_empty) {
      return this._renderEmptyBranch();
    }

    if (
      !this.state.experiment.maps.length &&
      !this.state.experiment.metrics.length
    ) {
      return this._renderEmptyIndex();
    }

    return (
      <>
        {this._renderExperimentHeader()}
        <div className='HubExperimentScreen__divider' />
        <UI.Tabs
          leftItems={
            <>
              <UI.Tab
                className=''
                active={this.state.activeTab === 'parameters'}
                onClick={() => this.setState({ activeTab: 'parameters' })}
              >
                Parameters
              </UI.Tab>
              <UI.Tab
                className=''
                active={this.state.activeTab === 'metrics'}
                onClick={() => this.setState({ activeTab: 'metrics' })}
              >
                Metrics
              </UI.Tab>
              <UI.Tab
                className=''
                active={this.state.activeTab === 'system'}
                onClick={() => this.setState({ activeTab: 'system' })}
              >
                System
              </UI.Tab>
              <UI.Tab
                className=''
                active={this.state.activeTab === 'settings'}
                onClick={() => this.setState({ activeTab: 'settings' })}
              >
                Settings
              </UI.Tab>
            </>
          }
        />
        <div className='HubExperimentScreen__body'>
          {this.state.activeTab === 'parameters' && this._renderParameters()}
          {this.state.activeTab === 'metrics' && this._renderMetrics()}
          {this.state.activeTab === 'system' && this._renderSystemMetrics()}
          {this.state.activeTab === 'settings' && this._renderSettings()}
        </div>
      </>
    );
  };

  render() {
    let experimentName = this.props.match.params.experiment_name;

    if (this.state.isLoading) {
      return null;
    }

    if (this.state.notFound) {
      return <Redirect to={screens.NOT_FOUND} />;
    }

    if (this.state.selectBranch) {
      return (
        <Redirect
          to={buildUrl(screens.HUB_PROJECT_EXPERIMENT, {
            experiment_name: this.state.selectBranch,
            commit_id: 'latest',
          })}
          push
        />
      );
    }

    return (
      <ProjectWrapper
        experimentName={experimentName}
        navigation={this._renderNavigation()}
        contentWidth={this.state.contentWidth}
      >
        <Helmet>
          <meta title='' content='' />
        </Helmet>

        <UI.Container size='small' ref={this.contentRef}>
          {this._renderContent()}
        </UI.Container>
      </ProjectWrapper>
    );
  }
}

export default withRouter(
  storeUtils.getWithState(
    classes.HUB_PROJECT_EXPERIMENT_SCREEN,
    HubExperimentScreen,
  ),
);
