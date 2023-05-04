import { NavLink } from 'react-router-dom';

import { styled } from 'config/stitches';

const BreadcrumbItem = styled(NavLink, {
  color: '$textPrimary50',
  textDecoration: 'none',
  fontWeight: '$3',
  textTransform: 'uppercase',
  fontSize: '$3',
  transition: 'all 0.18s ease-out',
  '&:hover': {
    color: '$textPrimary',
  },
  '&.active': {
    color: '$textPrimary',
  },
});

const BreadcrumbLastItem = styled('span', {
  fontWeight: '$3',
  textTransform: 'uppercase',
  fontSize: '$3',
  color: '$textPrimary',
});

export { BreadcrumbItem, BreadcrumbLastItem };
