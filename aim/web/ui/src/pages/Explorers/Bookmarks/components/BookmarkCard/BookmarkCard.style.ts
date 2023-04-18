import { NavLink } from 'react-router-dom';

import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';

const BookmarkCardContainer = styled(Box, {
  position: 'relative',
  display: 'flex',
  fd: 'column',
  p: '$13',
  bs: 'inset 0 -1px 0 0 #B5C4D3',
  '&:last-child': { borderBottom: 'none' },
});

const BookmarkLinkStyled = styled(NavLink, {
  color: '#1473E6',
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