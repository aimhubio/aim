import './Icon.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../utils';

class Icon extends Component {
  render() {
    const className = classNames({
      Icon: true,
      [this.props.className]: this.props.className,
      [this.props.i]: this.props.i,
      'material-icons-outlined': true,
      no_spacing_right: !this.props.spacingRight,
    });

    return (
      <span
        onClick={this.props.onClick}
        className={className}
        style={{
          ...this.props.style,
          fontSize: `${this.props.scale}em`,
          transform: `rotate(${this.props.rotate}deg)`,
        }}
      >
        {this.props.i}
      </span>
    );
  }
}

Icon.defaultProps = {
  scale: 1,
  rotate: null,
  onClick: () => {},
};

Icon.propTypes = {
  i: PropTypes.string.isRequired,
  spacingRight: PropTypes.bool,
  scale: PropTypes.number,
  rotate: PropTypes.number,
  onClick: PropTypes.func,
};

export default Icon;
