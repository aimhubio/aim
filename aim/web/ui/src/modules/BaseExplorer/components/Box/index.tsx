import React from 'react';

import './Box.scss';

function Box(props: any) {
  const boxConfig = props.engine.useStore(props.engine.boxConfig.stateSelector);
  return (
    <div
      className='BaseBox'
      style={{
        ...boxConfig,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

export default Box;
