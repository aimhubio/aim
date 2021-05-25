import './Input.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      indicatorWidth: 0,
    };

    this.inputRef = React.createRef();
  }

  render() {
    const className = classNames({
      Input: true,
      [this.props.className]: !!this.props.className,
      multiLine: this.props.multiLine,
      negative: this.props.negative,
      [this.props.size]: true,
    });

    let InputWrapper = 'Input__wrapper';
    if (this.props.classNameWrapper) {
      InputWrapper += ' ' + this.props.classNameWrapper;
    }

    let InputLabel = null;
    if (this.props.label) {
      InputLabel = <label className='Input__label'>{this.props.label}:</label>;
    }

    let params = {
      className,
      name: this.props.name,
      placeholder: this.props.placeholder,
      type: this.props.type,
      autoComplete: this.props.autoComplete,
      autoFocus: this.props.autoFocus,
      readOnly: this.props.readOnly,
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
      onKeyDown: this.props.onKeyDown,
      onChange: this._onChange,
      onKeyPress: this._onKeyPress,
      required: true,
      tabIndex: `${this.props.tabIndex}`,
      ref: this.inputRef,
      style: {
        paddingRight: 16 + this.state.indicatorWidth,
      },
    };

    let cont;
    if (this.props.multiLine) {
      cont = (
        <textarea
          id={this.props.id}
          ref={this.props.reference ? this.props.reference : 'input'}
          {...params}
          value={this.props.value}
        />
      );
    } else {
      cont = (
        <input
          id={this.props.id}
          ref={this.props.reference ? this.props.reference : 'input'}
          {...params}
          value={this.props.value}
          disabled={this.props.disabled}
        />
      );
    }

    return (
      <div className={InputWrapper} onClick={this.props.onClick}>
        {InputLabel}

        {cont}

        {this.props.indicator && (
          <div
            className='Input__indicator'
            ref={(ref) =>
              !this.state.indicatorWidth &&
              this.setState({ indicatorWidth: ref || 0 })
            }
          >
            {this.props.indicator}
          </div>
        )}

        {this.props.errorLabel && (
          <div className='Input__error_label'>{this.props.errorLabel}</div>
        )}
      </div>
    );
  }

  _onChange = (e) => {
    this.props.onChange && this.props.onChange(e);
    this.props.onTextChange && this.props.onTextChange(e.target.value);
  };

  _onKeyPress = (e) => {
    this.props.onKeyPress && this.props.onKeyPress(e);
  };
}

Input.defaultProps = {
  type: 'text',
  size: 'medium',
  tabIndex: 0,
};

Input.propTypes = {
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
  placeholder: PropTypes.any,
  onChange: PropTypes.func,
  onTextChange: PropTypes.func,
  multiLine: PropTypes.bool,
  value: PropTypes.any,
  indicator: PropTypes.node,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyPress: PropTypes.func,
  classNameWrapper: PropTypes.string,
  disabled: PropTypes.bool,
  negative: PropTypes.bool,
  label: PropTypes.string,
  errorLabel: PropTypes.string,
  type: PropTypes.string,
  tabIndex: PropTypes.number,
};

export default React.memo(Input);
