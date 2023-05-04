import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';

const BoardCardContainer = styled(Box, {
  width: '426px',
  height: '132px',
  border: '1px solid #B5C4D3',
  br: '$3',
  p: '$13',
  display: 'flex',
  fd: 'column',
});

const BoardCardHeader = styled('div', {
  display: 'flex',
  ai: 'center',
});

export { BoardCardContainer, BoardCardHeader };
