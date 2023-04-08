import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';

const BookmarkCardContainer = styled(Box, {
  position: 'relative',
  display: 'flex',
  fd: 'column',
  p: '$13',
  borderBottom: '1px solid $secondary30',
  '&:last-child': { borderBottom: 'none' },
});

const CodeBlockWrapper = styled('div', {
  '& pre': {
    maxHeight: '62px',
    '& > span': {
      display: 'flex',
      fw: 'wrap',
    },
  },
});

export { BookmarkCardContainer, CodeBlockWrapper };
