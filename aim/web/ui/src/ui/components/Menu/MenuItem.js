import './Menu.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../utils';

class MenuItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: this.props.active,
    };
  }

  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }

    if (!this.props.innerInteraction) {
      return;
    }

    this.setState((prevState) => ({
      ...prevState,
      active: !prevState.active,
    }));
  };

  render() {
    const compClassName = classNames({
      MenuItem: true,
      [this.props.className]: !!this.props.className,
      [this.props.activeClass]: this.props.innerInteraction
        ? this.state.active
        : this.props.active,
      select: !!this.props.subMenu.length,
    });

    const subClassName = classNames({
      MenuItem__subMenu: true,
      open: this.props.innerInteraction ? this.state.active : this.props.active,
    });

    return (
      <>
        <div className={compClassName} onClick={() => this.handleClick()}>
          {!!this.props.label ? this.props.label : this.props.children}
        </div>
        {!!this.props.subMenu.length && (
          <div className={subClassName}>
            {this.props.subMenu.map((item) => item)}
          </div>
        )}
      </>
    );
  }
}

MenuItem.defaultProps = {
  active: false,
  subMenu: [],
  innerInteraction: false,
  activeClass: 'active',
};

MenuItem.propTypes = {
  label: PropTypes.string,
  active: PropTypes.bool,
  subMenu: PropTypes.array,
  onClick: PropTypes.func,
  innerInteraction: PropTypes.bool,
  activeClass: PropTypes.oneOf(['active', 'activeCheck']),
};

export default MenuItem;
