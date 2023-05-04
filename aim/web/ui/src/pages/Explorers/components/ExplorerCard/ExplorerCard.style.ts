import { NavLink } from 'react-router-dom';

import { Text } from 'components/kit_v2';

import { styled } from 'config/stitches';

const ExplorerCardContainer = styled(NavLink, {
  width: '426px',
  minWidth: '426px',
  height: '118px',
  borderRadius: 3,
  p: '$8 $8 0',
  textDecoration: 'none',
  position: 'relative',
  transition: 'all 0.18s ease-out',
  '&:hover': {
    '.card-title': {
      textDecoration: 'underline',
    },
  },
});

const ExplorerCardBadge = styled(Text, {
  position: 'absolute',
  top: '-$5',
  right: '-$4',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  padding: '$1 $3',
  br: '3px',
  backgroundColor: 'white',
  bs: 'inset 0 1px 2px 0 #00000029',
  userSelect: 'none',
});

export { ExplorerCardContainer, ExplorerCardBadge };
