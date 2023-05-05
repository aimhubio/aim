import { styled } from 'config/stitches';

const Container = styled('div', {
  display: 'flex',
  ai: 'center',
  p: '0 $5',
  br: '$3',
  transition: 'all 0.2s ease-out',
  cursor: 'pointer',
  color: '#454545',
  fontSize: '$3',
  '&:hover': {
    bc: '#EFF0F2',
  },
  variants: {
    size: {
      sm: {
        height: '$1',
      },
      md: {
        height: '$3',
      },
      lg: {
        height: '$5',
      },
    },
  },
});

const Content = styled('div', {
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  m: '0 $3',
  flex: 1,
});

export { Container, Content };
