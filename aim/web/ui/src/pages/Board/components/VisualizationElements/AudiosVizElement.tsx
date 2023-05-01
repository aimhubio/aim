import * as React from 'react';

import AudiosList from '../AudiosList';

function AudiosVizElement(props: any) {
  return <AudiosList key={Date.now()} data={props.data} />;
}
export default AudiosVizElement;
