import './List.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function List({ children, className, header, icon, iconColor, margin }) {
  const compClassName = classNames({
    List: true,
    [className]: !!className,
    [icon]: !!icon,
    [iconColor]: !!iconColor,
    margin: margin,
  });

  return (
    <div>
      {!!header && <div className='List__header'>{header}</div>}
      <ul className={compClassName}>{children}</ul>
    </div>
  );
}

List.defaultProps = {
  header: null,
  icon: 'none',
  margin: true,
};

List.propTypes = {
  header: PropTypes.node,
  icon: PropTypes.oneOf(['none', 'dot', 'check', 'minus']),
  iconColor: PropTypes.oneOf(['primary']),
  margin: PropTypes.bool,
};

export default React.memo(List);
