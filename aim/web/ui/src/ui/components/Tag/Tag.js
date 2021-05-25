import './Tag.less';

import React from 'react';
import UI from '../..';
import PropTypes from 'prop-types';
import { classNames } from '../../../utils';

function Tag(props) {
  return (
    <UI.Label
      {...props}
      className={classNames({
        [props.className]: true,
        Tag__Label: true,
      })}
    >
      {props.children}
      <div className='Tag__Remove' onClick={props.onRemove}>
        x
      </div>
    </UI.Label>
  );
}

Tag.propTypes = {
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
  color: PropTypes.string,
  spacing: PropTypes.bool,
  onRemove: PropTypes.func,
};

export default Tag;
