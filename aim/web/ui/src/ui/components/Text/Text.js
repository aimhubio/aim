import './Text.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

class Text extends React.Component {
  render() {
    let textClassName = classNames({
      Text: true,
      [`text_${this.props.size}`]: !!this.props.size,
      [this.props.type]: !!this.props.type,
      subtitle: !!this.props.subtitle,
      caption: !!this.props.caption,
      overline: !!this.props.overline,
      link: !!this.props.link,
      divided: this.props.divided,
      no_spacing: !this.props.spacing,
      no_spacing_top: !this.props.spacingTop,
      left: this.props.left,
      center: this.props.center,
      right: this.props.right,
      inline: this.props.inline,
      bold: this.props.bold,
      uppercase: this.props.uppercase,
      italic: this.props.italic,
    });

    if (this.props.className) {
      textClassName = `${textClassName} ${this.props.className}`;
    }

    let compProps = {
      className: textClassName,
      onClick: this.props.onClick,
    };

    if (this.props.color) {
      compProps.style = {
        color: this.props.color,
      };
    }

    let comp = null;

    if (this.props.header) {
      switch (this.props.size) {
        case 1:
          comp = <h1 {...compProps}>{this.props.children}</h1>;
          break;
        case 2:
          comp = <h2 {...compProps}>{this.props.children}</h2>;
          break;
        case 3:
          comp = <h3 {...compProps}>{this.props.children}</h3>;
          break;
        case 4:
          comp = <h4 {...compProps}>{this.props.children}</h4>;
          break;
        case 5:
          comp = <h5 {...compProps}>{this.props.children}</h5>;
          break;
        default:
        case 6:
          comp = <h6 {...compProps}>{this.props.children}</h6>;
          break;
      }
    }

    if (this.props.small && this.props.inline) {
      comp = (
        <small {...compProps} style={{ display: 'inline' }}>
          {this.props.children}
        </small>
      );
    } else if (this.props.small && !this.props.inline) {
      comp = <small {...compProps}>{this.props.children}</small>;
    } else if (this.props.inline) {
      comp = <span {...compProps}>{this.props.children}</span>;
    }

    if (comp === null) {
      comp = <p {...compProps}>{this.props.children}</p>;
    }

    return comp;
  }
}

Text.defaultProps = {
  size: 0,
  type: 'unset',
  color: null,
  spacing: false,
  spacingTop: false,
};

Text.propTypes = {
  type: PropTypes.oneOf([
    'black',
    'white',
    'primary',
    'positive',
    'negative',
    'grey-dark',
    'grey-darker',
    'grey',
    'grey-light',
    'grey-lighter',
    'unset',
  ]),
  size: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),

  // Text components: headers, subtitle, caption, overline
  header: PropTypes.bool,
  subtitle: PropTypes.bool,
  caption: PropTypes.bool,
  overline: PropTypes.bool,
  small: PropTypes.bool,
  link: PropTypes.bool,

  // Styling
  color: PropTypes.string,
  divided: PropTypes.bool,
  left: PropTypes.bool,
  center: PropTypes.bool,
  right: PropTypes.bool,
  inline: PropTypes.bool,
  bold: PropTypes.bool,
  uppercase: PropTypes.bool,
  italic: PropTypes.bool,
  spacing: PropTypes.bool,
  spacingTop: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Text;
