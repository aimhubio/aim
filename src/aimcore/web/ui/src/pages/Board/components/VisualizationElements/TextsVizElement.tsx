import * as React from 'react';

import TextsList from '../TextsList';

function TextsVizElement(props: any) {
  return <TextsList key={Date.now()} data={props.data} />;
}

export default TextsVizElement;
