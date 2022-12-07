import React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { CSS, styled } from 'config/stitches/stitches.config';

import { IIconProps } from './Icon.d';

const Container = styled('div', {
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
 * @param {React.Ref} forwardRef
 * @param {React.ReactNode} icon
 * @param {string} size
 * @param {CSS} css
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @example
 * <Icon icon={IconName} />
 * <Icon icon={<IconName />} />
 * <Icon icon={<IconName />} size="sm" css={{ color: 'red' }}/>
 */
const Icon = React.forwardRef<React.ElementRef<typeof Container>, IIconProps>(
  ({ size = 'lg', css, icon, ...props }: IIconProps, forwardedRef) => {
    const Component = icon;
    return (
      <Container ref={forwardedRef}>
        <IconWrapper {...props} css={css} size={size}>
          <IconSlot>{typeof icon === 'object' ? icon : <Component />}</IconSlot>
        </IconWrapper>
      </Container>
    );
  },
);

export default React.memo(Icon);
