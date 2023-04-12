import { Box } from 'components/kit_v2';

import { styled } from '..';

const LayoutContainer = styled(Box, {
  maxWidth: '1310px',
  m: '0 auto', // Centers the container horizontally
  p: '0 $13', // Adds some padding to the left and right of the container
});

export { LayoutContainer };
