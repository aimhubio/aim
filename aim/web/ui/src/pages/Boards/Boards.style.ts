import { styled } from 'config/stitches';

const BoardsContainer = styled('section', {
  maxWidth: '1326px',
  p: '$13',
});

const BoardsCardWrapper = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '$13',
});
export { BoardsContainer, BoardsCardWrapper };
