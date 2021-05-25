import './Dropdown.less';

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { classNames } from '../../utils';

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.selectRef = React.createRef();
  }

  render() {
    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        color: state.isSelected ? '#FFF' : '#000',
        backgroundColor: state.isSelected
          ? '#395CA8'
          : state.isFocused
            ? '#EEE'
            : null,
        cursor: 'pointer',
        fontSize: '14px',
        ':active': {
          ...provided[':active'],
          backgroundColor: state.isSelected ? '#395CA8' : '#DDD',
        },
      }),
      container: (provided, state) => ({
        ...provided,
        width: this.props.width
          ? `${this.props.width}px`
          : this.props.inline
            ? '300px'
            : '100%',
      }),
    };

    let className = classNames({
      [this.props.className]: !!this.props.className,
      Dropdown__body: true,
      right: this.props.right,
    });

    const props = {};
    if (this.props.isOpen) {
      props.menuIsOpen = true;
    }

    return (
      <Select
        defaultValue={this.props.defaultValue}
        isMulti={this.props.multi}
        options={this.props.options}
        styles={customStyles}
        className={className}
        onInputChange={this.props.onInputChange}
        onChange={this.props.onChange}
        classNamePrefix='Dropdown'
        ref={this.selectRef}
        {...props}
      />
    );
  }
}

Dropdown.defaultProps = {
  multi: false,
  inline: true,
  defaultValue: null,
  right: false,
  isOpen: null,
};

Dropdown.propTypes = {
  isOpen: PropTypes.bool,
  multi: PropTypes.bool,
  options: PropTypes.array,
  defaultValue: PropTypes.any,
  inline: PropTypes.bool,
  right: PropTypes.bool,
  width: PropTypes.number,
  onChange: PropTypes.func,
};

export default Dropdown;
