import './Tab.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function Tabs(props) {
  let className = classNames({
    Tabs: true,
  });

  if (props.className) {
    className = `${className} ${props.className}`;
  }

  return (
    <div className={className}>
      <div className='Tabs__left'>
        {props.leftItems}
        {props.children}
      </div>
      <div className='Tabs__right'>{props.rightItems}</div>
    </div>
  );
}

Tabs.propTypes = {
  leftItems: PropTypes.node,
  rightItems: PropTypes.node,
};

export default React.memo(Tabs);
