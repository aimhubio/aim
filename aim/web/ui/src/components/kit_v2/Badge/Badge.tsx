import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { IBadgeProps } from './Badge.d';
import { BadgeContainer, getColors, RightIcon } from './Badge.style';

/**
 * Badge component params
 * @param {string} label - Label of the badge
 * @param {string} size - Size of the badge
 * @param {ColorPaletteType} color - Color of the badge
 * @param {boolean} disabled - Disabled state of the badge
 * @param {boolean} monospace - Monospace font of the badge
 * @param {function} onDelete - Callback function for delete action
 */

const Badge = React.forwardRef<
  React.ElementRef<typeof BadgeContainer>,
  IBadgeProps
>(
  (
    {
      label,
      size = 'md',
      css,
      color,
      monospace = false,
      disabled = false,
      onDelete,
      ...rest
    }: IBadgeProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <ErrorBoundary>
        <BadgeContainer
          {...rest}
          size={size}
          css={{ ...css, ...getColors({ color, disabled }) }}
          role='button'
          font={monospace ? 'mono' : 'default'}
          rightIcon={!!onDelete}
          ref={forwardedRef}
          disabled={disabled}
        >
          {label}
          {onDelete ? (
            <RightIcon
              role='button'
              name='close'
              fontSize={10}
              size={size}
              onClick={() => onDelete(label)}
            />
          ) : null}
        </BadgeContainer>
      </ErrorBoundary>
    );
  },
);

Badge.displayName = 'Badge';

export default Badge;
