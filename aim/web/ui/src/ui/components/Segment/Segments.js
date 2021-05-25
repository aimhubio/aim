import './Segment.less';

import React from 'react';

import { classNames } from '../../utils';

function Segments(props) {
  const className = classNames({
    Segments: true,
    [props.className]: !!props.className,
  });

  return (
    <div className={className}>
      <div className='Segments__cont'>{props.children}</div>
    </div>
  );
}

export default React.memo(Segments);
