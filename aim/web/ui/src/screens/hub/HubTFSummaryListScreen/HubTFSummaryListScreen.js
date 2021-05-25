import './HubTFSummaryListScreen.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import ProjectWrapper from '../../../wrappers/hub/ProjectWrapper/ProjectWrapper';
import UI from '../../../ui';
import * as storeUtils from '../../../storeUtils';
import * as classes from '../../../constants/classes';
import * as analytics from '../../../services/analytics';

class HubTFSummaryListScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tree: [],
      formParams: {
        params: '',
        parsedParams: {},
      },
      formSummary: null,
      formPath: null,
      formSaveBtn: {
        disabled: false,
        loading: false,
      },
    };
  }

  componentDidMount() {
    this.listTFSummary();

    // Analytics
    analytics.pageView('TF summary list');
  }

  listTFSummary = () => {
    this.setState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    this.props
      .getTFSummaryList()
      .then((data) => {
        const separatedPaths = data.map((p) =>
          p.split('/').filter((p) => p.length),
        );
        const tree = [];
        for (let path in separatedPaths) {
          this.appendPathToTree(tree, separatedPaths[path]);
        }
        this.setState((prevState) => ({
          ...prevState,
          tree,
        }));
      })
      .finally(() => {
        this.setState((prevState) => ({
          ...prevState,
          isLoading: false,
        }));
      });
  };

  appendPathToTree = (tree, path) => {
    let treeSubset = tree;

    for (let pathItemIdx in path) {
      let firstTreeItemMatchIdx = -1;
      for (let treeSubsetItemIdx in treeSubset) {
        if (treeSubset[treeSubsetItemIdx].path === path[pathItemIdx]) {
          firstTreeItemMatchIdx = treeSubsetItemIdx;
          break;
        }
      }

      if (firstTreeItemMatchIdx === -1) {
        const nodeOptions = {
          path: path[pathItemIdx],
          children: [],
        };

        if (parseInt(pathItemIdx) === path.length - 1) {
          nodeOptions.fullPath = path;
          nodeOptions.showActions = true;
          nodeOptions.showForm = false;
        }

        treeSubset.push(nodeOptions);
        treeSubset = treeSubset[treeSubset.length - 1].children;
      } else {
        treeSubset = treeSubset[firstTreeItemMatchIdx].children;
      }
    }
  };

  updateTreeNode = (tree, path, nodeOptions) => {
    let depthSubset = tree;
    let nodePrevState = null;

    for (let dirNameIdx in path) {
      let treeIndex = -1;
      for (let treeItem in depthSubset) {
        if (depthSubset[treeItem].path === path[dirNameIdx]) {
          treeIndex = parseInt(treeItem);
          break;
        }
      }
      if (treeIndex !== -1) {
        if (parseInt(dirNameIdx) === path.length - 1) {
          nodePrevState = depthSubset[treeIndex];
          break;
        } else {
          depthSubset = depthSubset[treeIndex].children;
        }
      } else {
        return;
      }
    }

    if (nodePrevState !== null) {
      Object.assign(nodePrevState, nodeOptions);
    }
  };

  formatPath = (path) => {
    return `/${path.join('/')}`;
  };

  setSummary = (value) => {
    let formSummary = null;
    let formParsedParams = null;

    // Parse input
    const valMatch = value.endsWith('\n') ? value : value + '\n';
    if (valMatch.match(/^(([A-z0-9_\-\.,]+)\s+([A-z0-9_\-\.,]+)\n+)+$/g)) {
      formSummary = value.split('\n').map((r) =>
        r
          .trim()
          .split(/\s+/)
          .map((v) => v.trim()),
      );
      formParsedParams = {};
      formSummary.forEach((i) => {
        if (i.length > 1) {
          formParsedParams[i[0]] = i[1];
        }
      });
    }

    this.setState((prevState) => ({
      ...prevState,
      formSummary,
      formParams: {
        ...prevState.formParams,
        parsedParams: formParsedParams,
      },
    }));
  };

  handleInputChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    this.setState((prevState) => ({
      ...prevState,
      formParams: {
        ...prevState.formParams,
        [name]: value,
      },
    }));

    this.setSummary(value);
  };

  handleParamBtnClick = (path) => {
    let tree = [...this.state.tree];

    if (this.state.formPath) {
      this.updateTreeNode(tree, this.state.formPath, {
        showForm: false,
        showActions: true,
      });
    }
    this.updateTreeNode(tree, path, {
      showForm: false,
      showActions: false,
      isLoading: true,
    });
    this.setState((prevState) => ({
      ...prevState,
      tree,
      formSaveBtn: {
        loading: false,
        disabled: false,
      },
    }));

    const fullPath = this.formatPath(path);

    this.props
      .getTFLogParams(fullPath)
      .then((data) => {
        this.updateTreeNode(tree, path, {
          showForm: true,
          isLoading: false,
        });
        this.setState((prevState) => ({
          ...prevState,
          tree,
          formPath: path,
          formParams: {
            params: data.params || '',
            parsedParams: {},
          },
        }));
        this.setSummary(data.params);
      })
      .catch(() => {
        this.updateTreeNode(tree, path, {
          showActions: true,
          isLoading: false,
          showForm: false,
          formSummary: null,
        });
        this.setState((prevState) => ({
          ...prevState,
          tree,
        }));
      });
  };

  handleSaveBtnClick = () => {
    this.setState({
      formSaveBtn: {
        loading: true,
        disabled: true,
      },
    });

    const path = this.formatPath(this.state.formPath);
    const params = this.state.formParams.params;
    const parsedParams = this.state.formParams.parsedParams;

    this.props
      .postTFLogParams(path, params, parsedParams)
      .then((data) => {
        const tree = [...this.state.tree];
        this.updateTreeNode(tree, this.state.formPath, {
          showForm: false,
          showActions: true,
        });
        this.setState((prevState) => ({
          ...prevState,
          tree,
          formPath: null,
        }));
      })
      .finally(() => {
        this.setState({
          formSaveBtn: {
            loading: false,
            disabled: false,
          },
        });
      });
  };

  handleCancelBtnClick = () => {
    const tree = [...this.state.tree];
    this.updateTreeNode(tree, this.state.formPath, {
      showForm: false,
      showActions: true,
    });
    this.setState((prevState) => ({
      ...prevState,
      tree,
      formPath: null,
      formSaveBtn: {
        loading: false,
        disabled: false,
      },
    }));
  };

  _renderParamsForm = (node) => {
    return (
      <div className='HubTFSummaryListScreen__node__params'>
        <UI.Text type='grey-dark' spacing>
          Set parameters to search and compare run
          <UI.Text type='grey-darker' inline>
            {' '}
            `{this.formatPath(node.fullPath)}`{' '}
          </UI.Text>
        </UI.Text>
        <div className='HubTFSummaryListScreen__node__params__form'>
          <UI.Text type='grey' small>
            Parameters:
          </UI.Text>
          <UI.Text type='grey' small>
            Parsed result:
          </UI.Text>
          <div className='HubTFSummaryListScreen__node__params__input'>
            <UI.Input
              name='params'
              multiLine={true}
              onChange={this.handleInputChange}
              value={this.state.formParams.params}
              placeholder={'lr 0.01\n' + 'hidden_dim 256\n' + 'conv 1'}
            />
          </div>
          <div className='HubTFSummaryListScreen__node__params__summary'>
            {this.state.formSummary !== null &&
              this.state.formSummary.length > 0 &&
              this.state.formSummary.map(
                (row, rowKey) =>
                  row.length > 1 && (
                    <UI.Text key={rowKey} small>
                      params.{row[0]} == {row[1]}
                    </UI.Text>
                  ),
              )}
          </div>
        </div>
        <UI.Buttons className='HubTFSummaryListScreen__node__params__buttons'>
          <UI.Button
            type='secondary'
            onClick={() => this.handleCancelBtnClick()}
          >
            Cancel
          </UI.Button>
          {(this.state.formSummary !== null ||
            !this.state.formParams.params) && (
            <UI.Button
              type='primary'
              onClick={() => this.handleSaveBtnClick()}
              {...this.state.formSaveBtn}
            >
              Save
            </UI.Button>
          )}
        </UI.Buttons>
      </div>
    );
  };

  _renderTree = (tree) => {
    if (!tree || !tree.length) {
      return null;
    }

    return tree.map((node, nodeKey) => (
      <div key={nodeKey} className='HubTFSummaryListScreen__node'>
        <div className='HubTFSummaryListScreen__node__title'>
          <UI.Text type='grey-dark'>{node.path}</UI.Text>
        </div>
        {node.children.length > 0 ? (
          this._renderTree(node.children)
        ) : (
          <div className='HubTFSummaryListScreen__node__body'>
            {node.showActions && (
              <UI.Buttons>
                <UI.Button
                  size='tiny'
                  type='positive'
                  onClick={() => this.handleParamBtnClick(node.fullPath)}
                >
                  Edit params
                </UI.Button>
              </UI.Buttons>
            )}
            {node.isLoading && (
              <UI.Text type='grey' small>
                Loading..
              </UI.Text>
            )}
            {node.showForm && this._renderParamsForm(node)}
          </div>
        )}
      </div>
    ));
  };

  _renderContent = () => {
    if (!this.props.project.tf_enabled) {
      return (
        <UI.Text type='grey' center>
          Can't find TF summary logs directory
        </UI.Text>
      );
    }

    if (this.state.isLoading) {
      return (
        <UI.Text type='grey' center>
          Loading..
        </UI.Text>
      );
    }

    return (
      <div className='HubTFSummaryListScreen__content'>
        <UI.Text size={6} header divided>
          TF Summary Logs
        </UI.Text>
        <UI.Text className='HubTFSummaryListScreen__desc' type='grey'>
          Configure your TensorFlow logs for fast and easy search or comparison
        </UI.Text>
        <div className='HubTFSummaryListScreen__tree'>
          {this._renderTree(this.state.tree)}
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

HubTFSummaryListScreen.propTypes = {};

export default storeUtils.getWithState(
  classes.HUB_TF_SUMMARY_LIST_SCREEN,
  HubTFSummaryListScreen,
);
