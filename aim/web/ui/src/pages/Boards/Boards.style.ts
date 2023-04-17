import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const BoardsContainer = styled(LayoutContainer, {
  py: '$13',
});

const BoardsCardWrapper = styled('div', {
  mt: '$9',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$13',
});
export { BoardsContainer, BoardsCardWrapper };
