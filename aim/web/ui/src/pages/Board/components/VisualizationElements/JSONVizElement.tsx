import * as React from 'react';

import DictVisualizer from 'components/kit/DictVisualizer';

function JSONVizElement(props: any) {
  return (
    <div className='VizComponentContainer'>
      <DictVisualizer src={props.data} />
    </div>
  );
}

export default JSONVizElement;
