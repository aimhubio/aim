import './Tab.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function Tab(props) {
  const className = classNames({
    Tab: true,
    [props.className]: !!props.className,
    active: props.active,
  });

  return (
    <div className={className} onClick={props.onClick}>
      {props.children}
    </div>
  );
}

Tab.defaultProps = {
  active: false,
  onClick: () => {},
};

Tab.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
};

export default React.memo(Tab);
