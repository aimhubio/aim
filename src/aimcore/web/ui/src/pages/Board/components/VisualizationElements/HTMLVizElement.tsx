import * as React from 'react';

function HTMLVizElement(props: any) {
  return (
    <div
      style={{ width: '100%' }}
      dangerouslySetInnerHTML={{ __html: props.data }}
    />
  );
}

export default HTMLVizElement;
