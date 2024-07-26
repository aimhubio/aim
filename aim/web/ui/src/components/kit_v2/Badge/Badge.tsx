import React from 'react';

import { IconX } from '@tabler/icons-react';

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
      color,
      css,
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
          css={{
            ...css,
            ...getColors({
              color,
              disabled,
              actionable: !!onDelete,
            }),
          }}
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
              icon={<IconX />}
              inputSize={size}
              size='md'
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
