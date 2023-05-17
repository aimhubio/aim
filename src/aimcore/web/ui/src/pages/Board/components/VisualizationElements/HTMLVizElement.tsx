import * as React from 'react';

function HTMLVizElement(props: any) {
  return (
    <div
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
      dangerouslySetInnerHTML={{ __html: props.data }}
    />
  );
}

export default HTMLVizElement;
