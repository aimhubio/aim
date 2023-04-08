import { styled } from 'config/stitches';

const BookmarksContainerStyled = styled('div', {
  overflow: 'auto',
  height: '100vh',
  minWidth: '648px',
  width: '648px',
  p: '$5 $13 $13',
});
const BookmarksListContainer = styled('div', {
  mt: '$5',
  bs: '0 0 0 1px $colors$secondary30',
  br: '$5',
});

export { BookmarksListContainer, BookmarksContainerStyled };
