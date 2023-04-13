import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const BookmarksContainerStyled = styled(LayoutContainer, {
  overflow: 'auto',
  height: '100vh',
  minWidth: '648px',
  py: '$13',
});
const BookmarksListContainer = styled('div', {
  mt: '$9',
  bs: '0 0 0 1px $colors$secondary30',
  br: '$3',
});

export { BookmarksListContainer, BookmarksContainerStyled };
