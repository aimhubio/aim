import './Label.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function Label({
  className,
  children,
  size,
  spacing,
  color,
  outline,
  rounded,
  iconLeft,
  iconRight,
  onClick,
  iconIsClickable,
  iconOnClick,
}) {
  const elemClassName = classNames({
    Label: true,
    [size]: true,
    spacing: spacing,
    outline: outline,
    rounded: rounded,
    [className]: !!className,
  });

  const styles = {};
  if (outline) {
    styles['borderColor'] = color;
  } else {
    styles['backgroundColor'] = color;
  }

  return (
    <div className={elemClassName} style={styles} onClick={onClick ?? null}>
      {!!iconLeft && (
        <div
          className={classNames({
            Label__icon: true,
            'Label__icon--left': true,
            'Label__icon--clickable': iconIsClickable,
          })}
          onClick={iconOnClick ?? null}
        >
          {iconLeft}
        </div>
      )}
      <div className='Label__content'>{children}</div>
      {!!iconRight && (
        <div
          className={classNames({
            Label__icon: true,
            'Label__icon--right': true,
            'Label__icon--clickable': iconIsClickable,
          })}
          onClick={iconOnClick ?? null}
        >
          {iconRight}
        </div>
      )}
    </div>
  );
}

Label.defaultProps = {
  size: 'small',
  spacing: false,
  color: '#D4D4D4',
  outline: false,
  rounded: false,
  iconLeft: null,
  iconRight: null,
  iconIsClickable: false,
  iconOnClick: null,
};

Label.propTypes = {
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
  color: PropTypes.string,
  spacing: PropTypes.bool,
  outline: PropTypes.bool,
  rounded: PropTypes.bool,
  iconLeft: PropTypes.node,
  iconRight: PropTypes.node,
  iconIsClickable: PropTypes.bool,
  iconOnClick: PropTypes.func,
};

export default React.memo(Label);
