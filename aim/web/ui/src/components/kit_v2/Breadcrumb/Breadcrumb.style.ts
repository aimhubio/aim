import { NavLink } from 'react-router-dom';

import { styled } from 'config/stitches';

const BreadcrumbItem = styled(NavLink, {
  color: '$textPrimary50',
  textDecoration: 'none',
  fontWeight: '$3',
  textTransform: 'uppercase',
  fontSize: '$3',
  '&.active': {
    color: '$textPrimary',
  },
});

export { BreadcrumbItem };
