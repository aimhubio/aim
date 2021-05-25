import './Line.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function Line({ size, spacing, color }) {
  const className = classNames({
    Line: true,
    [size]: true,
    spacing: spacing,
    [color]: true,
  });

  return <div className={className} />;
}

Line.defaultProps = {
  size: 'thin',
  spacing: true,
  color: 'secondary',
};

Line.propTypes = {
  size: PropTypes.oneOf(['thin', 'thick']),
  color: PropTypes.oneOf(['primary', 'secondary', 'negative']),
  spacing: PropTypes.bool,
};

export default React.memo(Line);
