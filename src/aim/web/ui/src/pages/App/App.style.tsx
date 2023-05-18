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
  display: 'block',
  textDecoration: 'none',
});

export { AppContainer, BoardWrapper, BoardLink };
