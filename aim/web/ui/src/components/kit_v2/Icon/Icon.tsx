import React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { styled } from 'config/stitches/stitches.config';

import { IIconProps } from './Icon.d';

const Container: any = styled('div', {
  display: 'inline-flex',
  ai: 'center',
  jc: 'center',
  size: '$1',
});

const IconWrapper = styled('i', {
  display: 'inline-flex',
  ai: 'center',
  jc: 'center',
  variants: {
    size: {
      sm: {
        size: '12px',
      },
      md: {
        size: '16px',
      },
      lg: {
        size: '$1',
      },
    },
  },
});

const IconSlot = styled(Slot, {
  width: '100%',
  height: '100%',
});

/**
 * Icon component
 * @param {IIconProps} props
 * @param {React.ReactNode} icon
 * @param {string} size
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @example
 * <Icon icon={IconName} />
 * <Icon icon={<IconName />} />
 * <Icon icon={<IconName />} size="sm" css={{ color: 'red' }}/>
 */
const Icon = React.forwardRef<React.ElementRef<typeof Container>, IIconProps>(
  (
    { size = 'lg', css, icon, color = '$textPrimary', ...props }: IIconProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    const Component = icon;
    return (
      <Container
        {...props}
        ref={forwardedRef}
        data-testid='icon'
        css={{ color, ...css }}
      >
        <IconWrapper size={size}>
          <IconSlot>{typeof icon === 'object' ? icon : <Component />}</IconSlot>
        </IconWrapper>
      </Container>
    );
  },
);

export default React.memo(Icon);
