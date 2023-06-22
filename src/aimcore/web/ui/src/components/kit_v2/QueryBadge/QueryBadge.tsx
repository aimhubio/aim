import * as React from 'react';

import { IconEye } from '@tabler/icons-react';

import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import IconButton from '../IconButton';
import Text from '../Text';

import { IQueryBadgeProps } from './QueryBadge.d';

/**
 * @component QueryBadge
 * @description QueryBadge component
 * @param {string} size - size of the QueryBadge
 * @param {string} color - color of the QueryBadge
 * @param {boolean} disabled - disabled state of the QueryBadge
 * @returns {React.FunctionComponentElement<React.ReactNode>} - React component
 * @example
 * <QueryBadge size="sm" color="primary" disabled={false} />
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
          <Text
            mono
            color={
              disabled
                ? '$textPrimary50'
                : color === 'primary'
                ? '$textPrimary80'
                : '$textPrimary'
            }
          >
            {children}
          </Text>
        </Button>
        <IconButton
          icon={<IconEye />}
          css={color === 'primary' ? { bc: '$primary10' } : {}}
        />
      </ButtonGroup>
    );
  },
);

QueryBadge.displayName = 'QueryBadge';

export default React.memo(QueryBadge);
