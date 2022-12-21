import React from 'react';

import { styled } from 'config/stitches/stitches.config';

const Container = styled('div', {
  height: '18px',
  bc: '#EAEBEC',
  borderBottom: '1px solid #DCDCDC',
  color: '$textPrimary',
  fontWeight: '$4',
  fontSize: '$2',
  letterSpacing: '0.5px',
  pl: '$7',
  display: 'flex',
  ai: 'center',
});

function ExplorerBar() {
  return <Container>Figures Explorer</Container>;
}

export default React.memo(ExplorerBar);
