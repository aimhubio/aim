import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const BoardsContainer = styled(LayoutContainer, {
  $$space: '$space$13',
  py: '$$space',
  height: 'calc(100vh - $$space)',
  overflowY: 'auto',
});

const BoardsCardWrapper = styled('div', {
  mt: '$9',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$13',
});

export { BoardsContainer, BoardsCardWrapper };
