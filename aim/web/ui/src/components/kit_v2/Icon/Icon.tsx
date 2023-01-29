import React from 'react';

import { IIconProps } from './Icon.d';
import { Container, IconSlot, IconWrapper } from './Icon.style';

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
