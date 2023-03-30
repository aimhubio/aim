import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const ExplorersContainer = styled(LayoutContainer, {
  p: '$11',
  gap: '$8',
  display: 'flex',
  ai: 'center',
  fw: 'wrap',
  '.StatisticsCard': {
    minWidth: '200px',
  },
});

const ExplorerCard = styled(Box, {
  border: '1px solid $secondary20',
  borderRadius: '$3',
  p: '$5',
  minWidth: '300px',
});
export { ExplorersContainer, ExplorerCard };
