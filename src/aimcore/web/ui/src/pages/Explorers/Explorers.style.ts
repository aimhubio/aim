import { NavLink } from 'react-router-dom';

import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';
import { LayoutContainer } from 'config/stitches/foundations/layout';

const ExplorersContentContainer = styled(LayoutContainer, {
  $$space: '$space$15',
  py: '$13',
  height: 'calc(100vh - $$space)',
  overflowY: 'auto',
  overflow: 'auto',
  display: 'flex',
  fd: 'column',
});

const ExplorerCardsWrapper = styled(Box, {
  gap: '$13',
  display: 'flex',
  ai: 'center',
  fw: 'wrap',
  mt: '$9',
});

const ExplorerBookmarkLink = styled(NavLink, {
  display: 'flex',
  textDecoration: 'none',
});

export {
  ExplorerCardsWrapper,
  ExplorersContentContainer,
  ExplorerBookmarkLink,
};
