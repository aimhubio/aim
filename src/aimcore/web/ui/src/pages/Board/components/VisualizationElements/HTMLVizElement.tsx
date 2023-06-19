import * as React from 'react';

import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';

const HtmlVizElementContainer = styled(Box, {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '$13',
  color: '$textPrimary',
  fontFamily: '$inter',
  fontSize: '$3',
  fontWeight: '$2',
  '& h3': {
    fontSize: '$6',
    fontWeight: '$2',
    color: '$textPrimary',
  },
  '& h2': {
    fontSize: '$9',
    fontWeight: '$2',
  },
});

function HTMLVizElement(props: any) {
  return (
    <HtmlVizElementContainer dangerouslySetInnerHTML={{ __html: props.data }} />
  );
}

export default HTMLVizElement;
