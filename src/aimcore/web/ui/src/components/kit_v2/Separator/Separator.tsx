import React from 'react';

import { SeparatorRoot } from './Separator.style';
import { ISeparatorProps } from './Separator.d';

/**
 * Separator component
 * @param {string} color - color of the separator line
 * @param {string} margin - margin of the separator line
 * @param {CSS} css - css of the separator line
 * @param {ISeparatorProps} props - HTML attributes
 * @returns {React.FunctionComponentElement<React.ReactNode>}
 * @example
 * <Separator />
 * <Separator color="$secondary30" margin="10px" />
 * <Separator color="$secondary30" margin="10px" css={{ backgroundColor: 'red' }} />
 * <Separator color="$secondary30" margin="10px" css={{ backgroundColor: 'red' }} orientation="vertical" />
 */
function Separator({
  orientation = 'horizontal',
  color = '$secondary30',
  margin,
  css,
  ...props
}: ISeparatorProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <SeparatorRoot
      {...props}
      className='Separator'
      css={{
        backgroundColor: color,
        margin: orientation === 'horizontal' ? `${margin} 0` : `0 ${margin}`,
        ...css,
      }}
      orientation={orientation}
      data-testid='separator'
    />
  );
}

Separator.displayName = 'Separator';
export default React.memo(Separator);
