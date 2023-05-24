import * as React from 'react';

import FiguresList from '../FiguresList';

function FiguresVizElement(props: any) {
  return <FiguresList key={Date.now()} data={props.data} />;
}
export default FiguresVizElement;
