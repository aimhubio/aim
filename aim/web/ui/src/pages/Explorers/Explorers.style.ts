import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const ExplorersContainer = styled(LayoutContainer, {
  p: '$11',
  gap: '$5',
  display: 'flex',
  ai: 'center',
  fw: 'wrap',
});

const ExplorerCard = styled(Box, {
  border: '1px solid $secondary20',
  borderRadius: '$3',
  p: '$5',
  minWidth: '300px',
  '& > a': {
    textDecoration: 'none',
    color: 'inherit',
  },
});
export { ExplorersContainer, ExplorerCard };
