import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import IconButton from '../IconButton';

import { IQueryBadgeProps } from './QueryBadge.d';

const ButtonText = styled('span', {
  color: '$textPrimary',
  variants: {
    color: {
      primary: {
        color: '$textPrimary80',
      },
      secondary: {
        color: '$textPrimary',
      },
    },
    disabled: {
      true: {
        color: '$textPrimary50',
      },
    },
  },
});

/**
 * @component QueryBadge
 * @description QueryBadge component
 * @param {string} size - size of the QueryBadge
 * @param {string} color - color of the QueryBadge
 * @param {boolean} disabled - disabled state of the QueryBadge
 */

const QueryBadge = React.forwardRef<
  React.ElementRef<typeof ButtonGroup>,
  IQueryBadgeProps
>(
  (
    {
      size = 'sm',
      color = 'secondary',
      disabled = false,
      variant = 'outlined',
      children,
      ...rest
    }: IQueryBadgeProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <ButtonGroup
        {...rest}
        color={color}
        size={size}
        variant={variant}
        disabled={disabled}
        ref={forwardedRef}
      >
        <Button
          css={color === 'primary' ? { bc: '$primary10' } : {}}
          horizontalSpacing='compact'
        >
          <ButtonText color={color} disabled={disabled}>
            {children}
          </ButtonText>
        </Button>
        <IconButton
          icon='eye-show-outline'
          css={color === 'primary' ? { bc: '$primary10' } : {}}
        />
      </ButtonGroup>
    );
  },
);

export default React.memo(QueryBadge);
