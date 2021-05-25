import './ExecutableViewForm.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UI from '../../../ui';

class ExecutableViewForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.name,
      parameter: this.props.parameter,
      environmentVariable: this.props.environmentVariable,
      scriptPath: this.props.scriptPath,
      interpreterPath: this.props.interpreterPath,
      workingDir: this.props.workingDir,
      aimExperiment: this.props.aimExperiment,
      aimIntegrate: this.props.aimIntegrate,
      parameterLists: [],
      environmentVariableLists: [],
    };

    this.parameterInputRef = React.createRef();
    this.evInputRef = React.createRef();
  }

  componentDidMount() {
    this.appendEV(null);
    this.appendParameters(null);
  }

  getForm = () => {
    return {
      ...this.state,
    };
  };

  handleInputChange = (e, callback = null) => {
    const value = e.target.value;
    const name = e.target.name;
    this.setState(
      {
        [name]: value,
      },
      () => {
        if (callback) {
          callback(e);
        }
      },
    );
  };

  // Handle both '--input 42' and '-flag'
  parseParameter = (parameterList) => {
    if (parameterList == null) {
      return [];
    }
    let splitInput = parameterList
      .split(' ')
      .filter((element) => element !== '');
    for (let i = 0; i < splitInput.length; i++) {
      if (splitInput[i].startsWith('--')) {
        if (i + 1 < splitInput.length) {
          splitInput[i] = splitInput[i].concat(' ', splitInput[i + 1]);
        }
      }
    }
    let parsedInput = splitInput.filter((element) => element.includes('-'));
    // Adding index & start index
    let currentStartPosition = 0;
    for (let j = 0; j < parsedInput.length; j++) {
      let elementLength = parsedInput[j].length;
      parsedInput[j] = {
        value: parsedInput[j],
        start: currentStartPosition,
        end: currentStartPosition + elementLength + 1,
        index: j,
      };
      currentStartPosition += elementLength + 1;
    }
    return parsedInput;
  };

  // Handle both '--input 42' and '-flag'
  parseEV = (listOfElement) => {
    if (listOfElement == null) {
      return [];
    }
    let parsedInput = listOfElement
      .split(' ')
      .filter((element) => element !== '');
    let currentStartPosition = 0;
    for (let j = 0; j < parsedInput.length; j++) {
      let elementLength = parsedInput[j].length;
      parsedInput[j] = {
        value: parsedInput[j],
        start: currentStartPosition,
        end: currentStartPosition + elementLength + 1,
        index: j,
      };
      currentStartPosition += elementLength + 1;
    }
    return parsedInput;
  };

  appendParameters = (e) => {
    this.setState({
      parameterLists: this.parseParameter(this.state.parameter),
    });
  };

  appendEV = (e) => {
    this.setState({
      environmentVariableLists: this.parseEV(this.state.environmentVariable),
    });
  };

  // parse '--batchsize 32' into 'batchsize: 32'
  // parse '-flag' into 'flag'
  // assume all input are valid
  parseInputToTag = (input) => {
    if (input.startsWith('--')) {
      return input.substring(2).replace(' ', ': ');
    }
    if (input.startsWith('-')) {
      return input.substring(1);
    }
  };

  removeTag = (inputTag, tagName, tagList) => {
    let inputTagLength = inputTag.end - inputTag.start;
    this.setState({
      [tagList]: this.state[tagList]
        .filter((element) => element !== inputTag)
        .map((tag, index) => {
          if (index >= inputTag.index) {
            return {
              value: tag.value,
              start: tag.start - inputTagLength,
              end: tag.end - inputTagLength,
              index: tag.index - 1,
            };
          } else {
            return tag;
          }
        }),
      [tagName]:
        this.state[tagName].substring(0, inputTag.start) +
        this.state[tagName].substring(inputTag.end),
    });
  };

  selectTag = (tag, inputRef) => {
    inputRef.current.setSelectionRange(tag.start, tag.end);
    inputRef.current.focus();
  };

  render() {
    const parameterTagsContent = this.state.parameterLists.map((parameter) => (
      <UI.Label
        key={parameter.value}
        onClick={() => this.selectTag(parameter, this.parameterInputRef)}
      >
        {this.parseInputToTag(parameter.value)}
        <div
          className='ExecutableViewForm__FormGroup__icon__wrapper'
          onClick={() =>
            this.removeTag(parameter, 'parameter', 'parameterLists')
          }
        >
          <UI.Icon i='delete' className='ExecutableViewForm__FormGroup__icon' />
        </div>
      </UI.Label>
    ));
    const evTagsContent = this.state.environmentVariableLists.map((ev) => (
      <UI.Label
        key={ev.value}
        onClick={() => this.selectTag(ev, this.evInputRef)}
      >
        {ev.value}
        <div
          className='ExecutableViewForm__FormGroup__icon__wrapper'
          onClick={() =>
            this.removeTag(
              ev,
              'environmentVariable',
              'environmentVariableLists',
            )
          }
        >
          <UI.Icon i='delete' className='ExecutableViewForm__FormGroup__icon' />
        </div>
      </UI.Label>
    ));
    const parameterTags =
      this.state.parameterLists.length > 0 ? (
        <div className='ExecutableViewForm__FormGroup__row'>
          {parameterTagsContent}
        </div>
      ) : null;
    const evTags =
      this.state.environmentVariableLists.length > 0 ? (
        <div className='ExecutableViewForm__FormGroup__row'>
          {evTagsContent}
        </div>
      ) : null;

    return (
      <>
        {!this.props.processForm && (
          <>
            <div className='ExecutableViewForm__FormGroup'>
              <UI.Input
                onChange={this.handleInputChange}
                name='name'
                value={this.state.name}
                label='Name'
                placeholder={'Name'}
              />
            </div>
            <UI.Line />
          </>
        )}
        <div className='ExecutableViewForm__FormGroup'>
          <UI.Text type='grey' spacing>
            Python Command
          </UI.Text>
          {!this.props.processForm && (
            <UI.Input
              onChange={this.handleInputChange}
              name='scriptPath'
              value={this.state.scriptPath}
              label='Script path'
              placeholder={'train.py'}
            />
          )}
          <div>
            <UI.Input
              id='parameterInput'
              reference={this.parameterInputRef}
              onChange={(e) => this.handleInputChange(e, this.appendParameters)}
              name='parameter'
              value={this.state.parameter}
              label='Arguments'
              placeholder={'--batch_size 32 --dropout 0.5'}
            />
            {parameterTags}
          </div>
        </div>
        <UI.Line />
        <div className='ExecutableViewForm__FormGroup'>
          <UI.Text type='grey' spacing>
            Environment
          </UI.Text>
          {!this.props.processForm && (
            <UI.Input
              onChange={this.handleInputChange}
              name='interpreterPath'
              value={this.state.interpreterPath}
              label='Python interpreter path'
              placeholder={'/usr/local/bin/python3'}
            />
          )}
          <div>
            <UI.Input
              id='evInput'
              reference={this.evInputRef}
              onChange={(e) => this.handleInputChange(e, this.appendEV)}
              name='environmentVariable'
              value={this.state.environmentVariable}
              label='Environment variables'
              placeholder={'CUDA_VISIBLE_DEVICES=0'}
            />
            {evTags}
          </div>
          {!this.props.processForm && (
            <UI.Input
              onChange={this.handleInputChange}
              name='workingDir'
              value={this.state.workingDir}
              label='Working directory full path'
              placeholder={'/workspace'}
            />
          )}
        </div>
        <UI.Line />
        <div className='ExecutableViewForm__FormGroup'>
          <UI.Text type='grey' spacing>
            Integrate with aim
          </UI.Text>
          <UI.Input
            onChange={this.handleInputChange}
            name='aimExperiment'
            value={this.state.aimExperiment}
            label='Experiment name'
            placeholder={'default'}
          />
        </div>
      </>
    );
  }
}

ExecutableViewForm.defaultProps = {
  name: '',
  parameter: '',
  environmentVariable: '',
  scriptPath: '',
  interpreterPath: '',
  workingDir: '',
  aimExperiment: '',
  aimIntegrate: true,
  processForm: false,
};

ExecutableViewForm.propTypes = {
  name: PropTypes.string,
  parameter: PropTypes.string,
  environmentVariable: PropTypes.string,
  scriptPath: PropTypes.string,
  interpreterPath: PropTypes.string,
  workingDir: PropTypes.string,
  aimExperiment: PropTypes.string,
  aimIntegrate: PropTypes.bool,
  processForm: PropTypes.bool,
};

export default ExecutableViewForm;
