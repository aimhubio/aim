import { NavLink } from 'react-router-dom';

import { styled, css } from 'config/stitches';
import { textEllipsis } from 'config/stitches/foundations/layout';

const StyledLink = css({
  textDecoration: 'none',
  display: 'block',
  variants: {
    underline: {
      true: {
        '&:hover': {
          textDecoration: 'underline',
        },
      },
      false: {},
    },
    ellipsis: {
      true: textEllipsis,
      false: {},
    },
  },
});
const StyledAnchor = styled('a', StyledLink);

const StyledNavLink = styled(NavLink, StyledLink);

export { StyledAnchor, StyledNavLink };
