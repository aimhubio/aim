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
  bs: 'inset 0 0 0 1px #B5C4D3',
  br: '$3',
});

const BookmarksNoResultsContainer = styled('div', {
  textAlign: 'center',
  bs: 'inset 0 -1px 0 0 #B5C4D3',
  p: '$13',
});

export {
  BookmarksListContainer,
  BookmarksContainerStyled,
  BookmarksNoResultsContainer,
};
