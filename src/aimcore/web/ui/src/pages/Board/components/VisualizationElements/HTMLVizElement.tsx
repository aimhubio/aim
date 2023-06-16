import * as React from 'react';

import { Box } from 'components/kit_v2';

function HTMLVizElement(props: any) {
  return (
    <Box
      style={{ width: '100%' }}
      css={{
        color: '$textPrimary',
        fontFamily: '$inter',
        fontSize: '$3',
        fontWeight: '$2',
      }}
      dangerouslySetInnerHTML={{ __html: props.data }}
    />
  );
}

export default HTMLVizElement;
