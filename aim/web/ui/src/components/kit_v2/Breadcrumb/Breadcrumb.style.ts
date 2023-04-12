import { NavLink } from 'react-router-dom';

import { styled } from 'config/stitches';

const BreadcrumbItem = styled(NavLink, {
  color: '$textPrimary50',
  textDecoration: 'none',
  '&.active': {
    color: '$textPrimary100',
  },
});

export { BreadcrumbItem };
