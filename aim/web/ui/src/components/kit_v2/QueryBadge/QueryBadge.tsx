import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import ButtonGroup from '../ButtonGroup';
import Button from '../Button';
import IconButton from '../IconButton';

import { IQueryBadgeProps } from './QueryBadge.d';

const ButtonWrapper = styled(Button, {
  variants: {
    size: {
      xs: {
        p: '0 $space$4',
      },
      sm: {
        p: '0 $space$4',
      },
      md: {
        p: '0 $space$5',
      },
      lg: {
        p: '0 $space$6',
      },
      xl: {
        p: '0 $space$7',
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

const QueryBadge = React.forwardRef<React.ElementRef<typeof ButtonGroup>, any>(
  (
    {
      size,
      color = 'secondary',
      disabled,
      children,
      ...props
    }: IQueryBadgeProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <ButtonGroup
        {...props}
        color={'primary'}
        size={'xl'}
        variant='outlined'
        ref={forwardedRef}
      >
        <Button>run dataset.name {'>'} 0</Button>
        <IconButton icon='eye-show-outline' />
      </ButtonGroup>
    );
  },
);

export default React.memo(QueryBadge);
