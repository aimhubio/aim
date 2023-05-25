import { NavLink } from 'react-router-dom';

import { styled } from 'config/stitches';

import { Box } from '../../components/kit_v2';

const AppContainer = styled('div', {
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
});

const BoardWrapper = styled(Box, {
  flex: 1,
  width: 'calc(100% - 200px)',
});

const BoardLink = styled(NavLink, {
  display: 'flex',
  padding: '0 $4',
  ai: 'center',
  color: 'unset',
  textDecoration: 'none',
  borderRadius: '$3',
  variants: {
    isActive: {
      true: {
        backgroundColor: '#EFF0F2',
      },
    },
  },
});

export { AppContainer, BoardWrapper, BoardLink };
