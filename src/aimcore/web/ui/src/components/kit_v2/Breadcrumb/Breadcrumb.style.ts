import { NavLink } from 'react-router-dom';

import { styled } from 'config/stitches';

const BreadcrumbItem = styled(NavLink, {
  color: '$text-default-text-muted',
  textDecoration: 'none',
  fontWeight: '$3',
  textTransform: 'uppercase',
  fontSize: '$3',
  transition: 'all 0.18s ease-out',
  '&:hover': {
    color: '$text-default-text-deep',
  },
  '&.active': {
    color: '$text-default-text-deep',
  },
});

const BreadcrumbLastItem = styled('span', {
  fontWeight: '$3',
  textTransform: 'uppercase',
  fontSize: '$3',
  color: '$text-default-text-deep',
});

export { BreadcrumbItem, BreadcrumbLastItem };
