import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const AppsContainer = styled(LayoutContainer, {
  $$space: '$space$15',
  py: '$$space',
  height: 'calc(100vh - $$space)',
  overflowY: 'auto',
});

const AppsCardWrapper = styled('div', {
  mt: '$9',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$13',
});

const AppCardContainer = styled(Box, {
  width: '426px',
  height: '132px',
  border: '1px solid #B5C4D3',
  br: '$3',
  p: '$13',
  display: 'flex',
  fd: 'column',
});

const AppCardHeader = styled('div', {
  display: 'flex',
  ai: 'center',
});

export { AppsContainer, AppsCardWrapper, AppCardContainer, AppCardHeader };
