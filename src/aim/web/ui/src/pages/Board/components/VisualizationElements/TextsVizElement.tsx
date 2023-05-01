import * as React from 'react';

import TextList from '../TextList';

function TextsVizElement(props: any) {
  return <TextList key={Date.now()} data={props.data} />;
}

export default TextsVizElement;
