import * as React from 'react';

import TextList from '../TextList';

function TextsVizElement(props: any) {
  return (
    <div className='VizComponentContainer'>
      <TextList key={Date.now()} data={props.data} />
    </div>
  );
}

export default TextsVizElement;
