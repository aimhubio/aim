import './Menu.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../utils';

class Menu extends Component {
  render() {
    const compClassName = classNames({
      Menu: true,
      [this.props.className]: !!this.props.className,
      bordered: this.props.bordered,
      lastChildBorder: this.props.lastChildBorder,
      interactive: this.props.interactive,
      outline: this.props.outline,
    });

    return (
      <div className={compClassName}>
        <div className='Menu__header__wrapper'>
          {this.props.headerElem !== null ? (
            <>{this.props.headerElem}</>
          ) : (
            !!this.props.header && (
              <div className='Menu__header'>{this.props.header}</div>
            )
          )}
        </div>
        {this.props.children}
      </div>
    );
  }
}

Menu.defaultProps = {
  bordered: true,
  lastChildBorder: false,
  outline: true,
  interactive: true,
  headerElem: null,
};

Menu.propTypes = {
  bordered: PropTypes.bool,
  lastChildBorder: PropTypes.bool,
  outline: PropTypes.bool,
  interactive: PropTypes.bool,
  header: PropTypes.string,
  headerElem: PropTypes.node,
};

export default Menu;
