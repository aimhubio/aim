import * as React from 'react';

import ImagesList from '../ImagesList';

function ImagesVizElement(props: any) {
  return <ImagesList key={Date.now()} data={props.data} />;
}
export default ImagesVizElement;
