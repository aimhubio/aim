import { NavLink } from 'react-router-dom';

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

const BookmarkLinkStyled = styled(NavLink, {
  textDecoration: 'none',
});
const CodeBlockWrapper = styled('div', {
  '& pre': {
    maxHeight: '62px',
    '& > span': {
      display: 'inline-flex',
      fw: 'wrap',
    },
  },
});

export { BookmarkCardContainer, CodeBlockWrapper, BookmarkLinkStyled };
