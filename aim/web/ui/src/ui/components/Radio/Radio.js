import './Radio.less';

import React from 'react';

function Radio(props) {
  return (
    <>
      <input
        type='radio'
        {...props}
        className={`Radio ${!!props.className ? props.className : ''}`.trim()}
        onChange={props.onChange ? props.onChange : () => null}
      />
      <label htmlFor={props.id} />
    </>
  );
}

export default Radio;
