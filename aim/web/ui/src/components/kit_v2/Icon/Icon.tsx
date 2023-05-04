import React from 'react';

import { IIconProps } from './Icon.d';
import { Container, IconSlot, IconWrapper } from './Icon.style';

/**
 * Icon component
 * @param {string} size
 * @param {React.ReactNode} icon
 * @param {string} color
 * @param {CSS} css
 * @param {IIconProps} props
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @example
 * <Icon icon={IconName} />
 * <Icon icon={<IconName />} />
 * <Icon icon={<IconName />} size="sm" css={{ color: 'red' }}/>
 */
const Icon = React.forwardRef<React.ElementRef<typeof Container>, IIconProps>(
  (
    { size = 'lg', css, icon, color, ...props }: IIconProps,
    forwardedRef,
  ): React.FunctionComponentElement<React.ReactNode> => {
    return (
      <Container
        {...props}
        data-testid='icon'
        css={{ color, ...css }}
        ref={forwardedRef}
      >
        <IconWrapper size={size}>
          <IconSlot>{icon}</IconSlot>
        </IconWrapper>
      </Container>
    );
  },
);

Icon.displayName = 'Icon';
export default React.memo(Icon);
