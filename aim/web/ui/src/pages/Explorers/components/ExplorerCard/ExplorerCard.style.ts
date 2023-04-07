import { NavLink } from 'react-router-dom';

import { Text } from 'components/kit_v2';

import { styled } from 'config/stitches';

const ExplorerCardContainer = styled(NavLink, {
  width: '316px',
  height: 110,
  borderRadius: 3,
  p: '$8 $8 0',
  textDecoration: 'none',
  position: 'relative',
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
  bs: '0 1px 2px 0 #00000029',
  userSelect: 'none',
});

export { ExplorerCardContainer, ExplorerCardBadge };
