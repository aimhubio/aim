import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import IconButton from '../IconButton';

import { IQueryBadgeProps } from './QueryBadge.d';

const Container = styled(ButtonGroup, {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  fontWeight: '$2',
  cursor: 'pointer',
  br: '$3',
  lineHeight: '1',
  transition: 'all 0.2s ease-in-out',
  bs: '$1',
  fontSize: '$3',
  variants: {
    size: {},
  },
});

/**
 * @component QueryBadge
 * @description QueryBadge component
 * @param {string} size - size of the QueryBadge
 * @param {string} color - color of the QueryBadge
 * @param {boolean} disabled - disabled state of the QueryBadge
 */

const QueryBadge = React.forwardRef<React.ElementRef<typeof Container>, any>(
  (
    {
      size,
      color = 'secondary',
      disabled,
      children,
      ...props
    }: IQueryBadgeProps,
    forwardedRed,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <ButtonGroup {...props} color={color} size={size} variant='outlined'>
        <Button>button</Button>
        <Button>button</Button>
        <Button>button</Button>
        <IconButton icon='eye-show-outline' />
      </ButtonGroup>
    );
  },
);

export default React.memo(QueryBadge);
