import { NavLink } from 'react-router-dom';

import { styled, css } from 'config/stitches';

const StyledLink = css({
  textDecoration: 'none',
  variants: {
    underline: {
      true: {
        '&:hover': {
          textDecoration: 'underline',
        },
      },
      false: {},
    },
  },
});
const StyledAnchor = styled('a', StyledLink);

const StyledNavLink = styled(NavLink, StyledLink);

export { StyledAnchor, StyledNavLink };
