import './Button.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function Button(props) {
  const className = classNames({
    Button: true,
    [props.className]: !!props.className,
    [props.size]: true,
    [props.type]: true,
    ghost: props.ghost,
    gradient: props.gradient,
    no_gradient: !props.gradient,
    disabled: props.disabled,
  });

  return (
    <button
      className={className}
      onClick={(e) => props.onClick && props.onClick(e)}
      style={props.style}
    >
      {!!props.iconLeft && (
        <div className='Button__icon left'>{props.iconLeft}</div>
      )}
      <div className='Button__content'>{props.children}</div>
      {!!props.iconRight && (
        <div className='Button__icon right'>{props.iconRight}</div>
      )}
    </button>
  );
}

Button.defaultProps = {
  size: 'medium',
  type: 'primary',
  ghost: false,
  gradient: false,
  style: {},
  iconLeft: null,
  iconRight: null,
};

Button.propTypes = {
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
  type: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative']),
  iconLeft: PropTypes.node,
  iconRight: PropTypes.node,
  style: PropTypes.object,
  ghost: PropTypes.bool,
  gradient: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export function Buttons(props) {
  return (
    <div
      className={classNames({
        Buttons: true,
        [props.className]: !!props.className,
      })}
    >
      {props.children}
    </div>
  );
}

export default React.memo(Button);
