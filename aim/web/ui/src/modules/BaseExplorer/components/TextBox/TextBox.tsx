import * as React from 'react';

import './TextBox.scss';

function TextBox(props: any) {
  const text = props.data.data.data;
  console.log(props);
  return (
    <div className='TextBox' style={{ color: props.data.style.color }}>
      <pre>{text}</pre>
    </div>
  );
}

export default React.memo(TextBox);
