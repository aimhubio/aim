import { NavLink } from 'react-router-dom';

import { Box } from 'components/kit_v2';

import { styled } from 'config/stitches';

const SidebarContainer = styled(Box, {
  width: '62px',
  maxWidth: '62px',
  position: 'relative',
  display: 'flex',
  fd: 'column',
  borderRight: '1px solid $border30',
  height: '100vh',
});

const SidebarUl = styled('ul', {
  p: 0,
  display: 'flex',
  flex: '1 100%',
  overflow: 'hidden',
  flexDirection: 'column',
});

const SidebarLiContainer = styled('div', {
  mt: '$7',
  display: 'flex',
  gap: '$7',
  fd: 'column',
});

const SidebarLi = styled('li', {
  height: '48px',
  display: 'flex',
  fd: 'column',
  jc: 'center',
  ai: 'center',
});

const SidebarLink = styled(NavLink, {
  position: 'relative',
  textDecoration: 'none',
  '&.active': {
    display: 'block',
    span: {
      color: '$textPrimary',
    },
    '&:before': {
      content: '',
      position: 'absolute',
      top: -2,
      left: 0,
      height: '52px',
      width: '3px',
      backgroundColor: '#1473e6',
      br: '0 3px 3px 0',
    },
  },
});

const SidebarBottom = styled('div', {
  pt: '$7',
  position: 'relative',
  pb: '$7',
  display: 'flex',
  jc: 'center',
  ai: 'center',
  fd: 'column',
});

const SidebarBottomAnchor = styled('a', {
  display: 'flex',
  jc: 'center',
  ai: 'center',
  height: '44px',
  width: '100%',
});

export {
  SidebarContainer,
  SidebarLiContainer,
  SidebarUl,
  SidebarLi,
  SidebarLink,
  SidebarBottom,
  SidebarBottomAnchor,
};
