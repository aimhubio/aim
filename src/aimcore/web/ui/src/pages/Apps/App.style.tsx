import { NavLink } from 'react-router-dom';

import { styled } from 'config/stitches';

import { Box } from '../../components/kit_v2';

const AppContainer = styled('div', {
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
  '.ant-tree-node-content-wrapper': {
    position: 'unset !important',
  },
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
  '&:after': {
    position: 'absolute',
    content: '""',
    display: 'block',
    width: '187px',
    height: '28px',
    left: '0',
  },
});

export { AppContainer, BoardWrapper, BoardLink };
