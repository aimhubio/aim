import { NavLink } from 'react-router-dom';

import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const ExplorersContentContainer = styled(LayoutContainer, {
  height: '100vh',
  overflow: 'auto',
  display: 'flex',
  fd: 'column',
  py: '$13',
});

const ExplorerCardsWrapper = styled(Box, {
  gap: '$8',
  display: 'flex',
  ai: 'center',
  fw: 'wrap',
  mt: '$9',
});

const ExplorerBookmarkLink = styled(NavLink, {
  textDecoration: 'none',
});

export {
  ExplorerCardsWrapper,
  ExplorersContentContainer,
  ExplorerBookmarkLink,
};
