import './FormGroup.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function FormGroup({ children }) {
  const className = classNames({
    FormGroup: true,
  });

  return <div className={className}>{children}</div>;
}

FormGroup.propTypes = {};

export default React.memo(FormGroup);
