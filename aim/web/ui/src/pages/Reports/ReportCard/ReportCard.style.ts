import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';

const ReportCardContainer = styled(Box, {
  position: 'relative',
  display: 'flex',
  fd: 'column',
  p: '$13',
  bs: 'inset 0 -1px 0 0 #B5C4D3',
  '&:last-child': { borderBottom: 'none' },
});

const ReportCardHeader = styled('div', {
  display: 'flex',
  ai: 'center',
});

export { ReportCardContainer, ReportCardHeader };
