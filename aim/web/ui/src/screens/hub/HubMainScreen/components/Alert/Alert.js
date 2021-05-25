import './Alert.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../../../../utils';

function Alert({ segment, children }) {
  return (
    <div
      className={classNames({
        HubMainScreenAlert: true,
        'HubMainScreenAlert--segment': segment,
      })}
    >
      {children}
    </div>
  );
}

Alert.defaultProps = {
  segment: false,
};

Alert.propTypes = {
  segment: PropTypes.bool,
};

export default Alert;
