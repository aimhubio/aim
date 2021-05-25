import './Segment.less';

import React from 'react';
import PropTypes from 'prop-types';

import { classNames } from '../../utils';

function Segment(props) {
  const className = classNames({
    Segment: true,
    [props.className]: !!props.className,
    bordered: props.bordered,
    [props.type]: !!props.type,
    spacing: props.spacing,
  });

  return (
    <div className={className}>
      <div className='Segment__cont'>{props.children}</div>
    </div>
  );
}

Segment.defaultProps = {
  bordered: true,
  spacing: true,
  type: 'neutral',
};

Segment.propTypes = {
  bordered: PropTypes.bool,
  spacing: PropTypes.bool,
  type: PropTypes.oneOf(['primary', 'neutral', 'secondary', 'negative']),
};

export default React.memo(Segment);
