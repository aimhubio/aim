import './SearchBar.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UI from '../../../ui';
import { deepEqual } from '../../../utils';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prevQuery: '',
      value: this.props.initValue,
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    // Ignore props(only one prop `initValue` so far)
    return !deepEqual(nextState, this.state);
  }

  handleKeyPress = (evt) => {
    if (evt.charCode === 13) {
      this.props.onSubmit(this.state.value);
      return false;
    }
  };

  setValue = (value, submit = true) => {
    this.setState({ value }, () => {
      if (submit) {
        this.props.onSubmit(this.state.value);
      }
    });
  };

  getValue = () => {
    return this.state.value;
  };

  onChange = (value) => {
    this.setState({
      value,
    });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  onClear = () => {
    this.setState({
      value: '',
    });

    if (this.props.onClear) {
      this.props.onClear('');
    }
  };

  render() {
    return (
      <div className='SearchBar'>
        <div className='SearchBar__search'>
          <UI.Icon i='search' className='SearchBar__search__icon' />
          <UI.Input
            className='SearchBar__search__input'
            classNameWrapper='SearchBar__search__input__wrapper'
            placeholder={this.props.placeholder}
            value={this.state.value}
            onChange={(evt) => this.onChange(evt.target.value)}
            onKeyPress={(evt) => this.handleKeyPress(evt)}
          />
          {!!this.state.value && (
            <div
              className='SearchBar__search__icon clear clickable'
              onClick={() => this.onClear()}
            />
          )}
        </div>
      </div>
    );
  }
}

SearchBar.defaultProps = {
  placeholder: 'Type search query..',
  initValue: '',
  onClear: null,
  onChange: null,
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  initValue: PropTypes.string,
  onClear: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default SearchBar;
