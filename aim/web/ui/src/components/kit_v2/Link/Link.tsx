import React from 'react';

import { StyledAnchor, StyledNavLink } from './Link.style';
import { ILinkProps } from './Link.d';

/**
 * @description Link component with styled-system props
 * @param {ILinkProps} props - props
 * @param {string} [props.fontSize='$5'] - font size
 * @param {string} [props.fontWeight='$2'] - font weight
 * @param {string} [props.color='$primary100'] - color
 * @param {boolean} [props.ellipsis=false] - ellipsis
 * @param {boolean} [props.underline=true] - underline
 * @param {CSS} [props.css] - css
 * @param {React.ReactNode} [props.children] - children
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 */
function Link({
  to,
  fontSize = '$5',
  fontWeight = '$2',
  color = '$primary100',
  ellipsis = false,
  underline = true,
  css = {},
  children,
  ...props
}: ILinkProps): React.FunctionComponentElement<React.ReactNode> {
  function renderLink() {
    // check if link is external or internal
    let isExternalLink = false;
    if (
      typeof window !== 'undefined' &&
      typeof window.location !== 'undefined'
    ) {
      const url = new URL(to, window.location.href);
      isExternalLink = url.hostname !== window.location.hostname;
    }

    // collecting the css props
    const cssProps = {
      fontSize,
      fontWeight,
      color,
      ...css,
    };

    // rendering the link based on the type
    if (isExternalLink) {
      const relProps = props.rel
        ? props.rel + ' noopener noreferrer'
        : 'noopener noreferrer';
      return (
        <StyledAnchor
          underline={underline}
          ellipsis={ellipsis}
          css={cssProps}
          href={to}
          target={props.target || '_blank'}
          rel={relProps}
          {...props}
        >
          {children}
        </StyledAnchor>
      );
    }
    return (
      <StyledNavLink
        ellipsis={ellipsis}
        underline={underline}
        css={cssProps}
        to={to}
        {...props}
      >
        {children}
      </StyledNavLink>
    );
  }

  return renderLink();
}

Link.displayName = 'Link';
export default React.memo(Link);
