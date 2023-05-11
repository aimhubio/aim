import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const BookmarksContainerStyled = styled(LayoutContainer, {
  $$space: '$space$15',
  py: '$13',
  height: 'calc(100vh - $$space)',
  overflowY: 'auto',
  overflow: 'auto',
  minWidth: '648px',
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
