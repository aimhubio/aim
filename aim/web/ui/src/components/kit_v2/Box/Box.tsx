import React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches';

import { IBoxProps } from './Box.d';

const StyledBox = styled(Slot, {
  '&[data-disabled=true]': {
    pointerEvents: 'none',
    userSelect: 'none',
    opacity: 0.4,
  },
});

/**
 * Polymorphic Box component
 * @param {IBoxProps} props
 * @param {keyof React.ElementType} as - HTML element or React component
 * @param {object} css - css object
 * @param {React.ReactNode} children - React children
 * @param {Partial<React.AllHTMLAttributes<HTMLElement>>} rest - HTML attributes
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @see https://www.radix-ui.com/docs/primitives/utilities/slot
 * @see https://stitches.dev/docs/overriding-styles#the-css-prop
 */

const Box = React.forwardRef<typeof StyledBox, IBoxProps>(
  (
    { as = 'div', css, children, ...props }: IBoxProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const Component = as;
    const { layoutProps, restProps } = React.useMemo(() => {
      const layoutKeys = [
        'display',
        'flex',
        'gap',
        'fd',
        'fw',
        'ai',
        'jc',
        'm',
        'mt',
        'mr',
        'mb',
        'ml',
        'p',
        'pt',
        'pr',
        'pb',
        'pl',
        'width',
        'height',
        'bg',
        'color',
      ];
      const layoutProps = Object.entries(props)
        .filter(([key]) => layoutKeys.includes(key))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, any>);

      const restProps = Object.entries(props)
        .filter(([key]) => !layoutKeys.includes(key))
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, any>);
      return { layoutProps, restProps };
    }, [props]);

    return (
      <StyledBox
        {...restProps}
        css={{
          ...layoutProps,
          ...css,
        }}
        ref={forwardedRef as React.RefObject<HTMLElement>}
      >
        <Component>{children}</Component>
      </StyledBox>
    );
  },
);

Box.displayName = 'Box';
export default React.memo(Box);
