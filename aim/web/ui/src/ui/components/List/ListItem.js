import './List.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function ListItem({ children, className, description }) {
  const compClassName = classNames({
    ListItem: true,
    [className]: !!className,
  });

  return (
    <li className={compClassName}>
      {children}
      {!!description && <div className='ListItem__desc'>{description}</div>}
    </li>
  );
}

ListItem.defaultProps = {
  description: '',
};

ListItem.propTypes = {
  description: PropTypes.string,
};

export default React.memo(ListItem);
