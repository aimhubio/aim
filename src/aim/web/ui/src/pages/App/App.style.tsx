import { NavLink } from 'react-router-dom';

import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

import { Box } from '../../components/kit_v2';

const AppContainer = styled(LayoutContainer, {
  $$space: '$space$15',
  py: '$$space',
  overflowY: 'auto',
  display: 'flex',
});

const BoardContainer = styled(Box, {
  mt: '$6',
});

const BoardWrapper = styled(Box, {
  border: '1px solid #B5C4D3',
  p: '$4',
  mt: '$4',
  flex: 1,
});

const BoardLink = styled(NavLink, {
  display: 'flex',
  textDecoration: 'none',
});

export { AppContainer, BoardContainer, BoardWrapper, BoardLink };
