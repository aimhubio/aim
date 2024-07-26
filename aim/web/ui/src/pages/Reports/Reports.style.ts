import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/layout';

const ReportsContainer = styled(LayoutContainer, {
  $$space: '$space$15',
  py: '$$space',
  height: 'calc(100vh - $$space)',
  overflowY: 'auto',
});

const ReportsCardWrapper = styled('div', {
  mt: '$9',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$13',
});

const BookmarksContainerStyled = styled(LayoutContainer, {
  overflow: 'auto',
  height: '100vh',
  minWidth: '648px',
  py: '$13',
});
const ReportsListContainer = styled('div', {
  mt: '$9',
  bs: 'inset 0 0 0 1px #B5C4D3',
  br: '$3',
});

const ReportsNoResultsContainer = styled('div', {
  textAlign: 'center',
  bs: 'inset 0 -1px 0 0 #B5C4D3',
  p: '$13',
});

export {
  ReportsContainer,
  ReportsCardWrapper,
  BookmarksContainerStyled,
  ReportsListContainer,
  ReportsNoResultsContainer,
};
