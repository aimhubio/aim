import './PopUp.less';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../../../../../../utils';

class PopUp extends Component {
  render() {
    return (
      <div
        className={classNames({
          PopUp: true,
          [this.props.className]: !!this.props.className,
          xGap: this.props.xGap,
        })}
        onClick={(e) => this.props.onClick(e)}
        onMouseMove={(e) => this.props.onMouseMove(e)}
        style={{
          left: this.props.left,
          top: this.props.top,
          bottom: this.props.bottom,
          width: this.props.width,
        }}
      >
        {this.props.chainArrow && (
          <div
            className={classNames({
              PopUp__body__arrow: true,
              [this.props.chainArrow]: !!this.props.chainArrow,
            })}
          />
        )}
        <div
          className='PopUp__body'
          style={{
            maxHeight: this.props.height,
          }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

PopUp.defaultProps = {
  left: 0,
  top: 0,
  bottom: null,
  width: 250,
  height: 200,
  xGap: false,
  chainArrow: null,
  onClick: () => {},
  onMouseMove: () => {},
};

PopUp.propTypes = {
  left: PropTypes.number,
  top: PropTypes.number,
  bottom: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  xGap: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseMove: PropTypes.func,
  chainArrow: PropTypes.string,
};

export default PopUp;
