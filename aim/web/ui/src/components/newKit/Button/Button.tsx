import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import { IButtonProps } from './Button.d';

function getStylesFromColor(
  color: IButtonProps['color'],
  variant: IButtonProps['variant'],
) {
  switch (variant) {
    case 'contained':
      return {
        backgroundColor: `$${color}100`,
        color: 'white',
        '&:hover': {
          backgroundColor: `$${color}110`,
        },
        '&:active': {
          backgroundColor: `$${color}120`,
        },
      };
    case 'outlined':
      return {
        backgroundColor: 'white',
        color: `$${color}100`,
        boxShadow: 'inset 0px 0px 0px 1px',
        '&:hover': {
          backgroundColor: `$${color}10`,
          color: `$${color}110`,
        },
        '&:active': {
          backgroundColor: `$${color}20`,
          color: `$${color}120`,
        },
      };
    case 'text':
      return {
        backgroundColor: 'white',
        color: `$${color}100`,
        '&:hover': {
          backgroundColor: `$${color}10`,
          color: `$${color}110`,
        },
        '&:active': {
          backgroundColor: `$${color}20`,
          color: `$${color}120`,
        },
      };
  }
}

const Container = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  fontWeight: 500,
  cursor: 'pointer',
  borderRadius: '3px',
  transition: 'all 0.2s ease-in-out',
  variants: {
    // variant: {
    //   contained: {},
    //   text: {},
    //   outlined: {
    //     backgroundColor: 'white',
    //   },
    // },
    // color: {
    //   primary: {},
    //   red: {},
    // },
    size: {
      small: {
        height: '$sizes$20',
        padding: '0 $space$12',
        fontSize: '$fontSizes$10',
      },
      medium: {
        height: '$sizes$24',
        padding: '0 $space$12',
        fontSize: '$fontSizes$12',
      },
      large: {
        height: '$sizes$28',
        padding: '0 $space$12',
        fontSize: '$fontSizes$12',
      },
      xLarge: {
        height: '$sizes$32',
        padding: '0 $space$12',
        fontSize: '$fontSizes$12',
      },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
  },

  //   compoundVariants: [
  //     {
  //       color: 'primary',
  //       variant: 'outlined',
  //       css: {
  //         color: '#105CB8',
  //         boxShadow: 'inset 0px 0px 0px 1px #1473E6',
  //         '&:hover': {
  //           background: '#E8F1FD',
  //         },
  //         '&:active': {
  //           color: '#0C4B97',
  //           background: '#D0E3FA',
  //         },
  //       },
  //     },
  //     {
  //       color: 'primary',
  //       variant: 'contained',
  //       css: {
  //         color: 'white',
  //         backgroundColor: '#1473E6',
  //         '&:hover': { backgroundColor: '#105CB8' },
  //         '&:active': { backgroundColor: '#0C4B97' },
  //       },
  //     },
  //     {
  //       color: 'primary',
  //       disabled: 'true',
  //       variant: 'outlined',
  //       css: {
  //         color: '#105CB8',
  //         boxShadow: 'inset 0px 0px 0px 1px #1473E6',
  //         '&:hover': {
  //           background: '#E8F1FD',
  //         },
  //         '&:active': {
  //           color: '#0C4B97',
  //           background: '#D0E3FA',
  //         },
  //       },
  //     },
  //     {
  //       color: 'primary',
  //       variant: 'text',
  //       css: {
  //         color: '#105CB8',
  //         '&:hover': {
  //           background: '#E8F1FD',
  //         },
  //         '&:active': {
  //           color: '#0C4B97',
  //           background: '#D0E3FA',
  //         },
  //       },
  //     },
  //   ],
  defaultVariants: {
    // color: 'violet',
  },
});

function Button({
  color = 'primary',
  size = 'small',
  variant = 'contained',
  children,
  ...rest
}: IButtonProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Container
      css={{ ...rest.style, ...getStylesFromColor(color, variant) }}
      //   color={color}
      size={size}
      disabled={rest.disabled}
      {...rest}
    >
      {children}
    </Container>
  );
}

export default React.memo(Button);
