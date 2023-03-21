import React from 'react';

import { SeparatorRoot } from './Separator.style';
import { ISeparatorProps } from './Separator.d';

function Separator({
  color = '$secondary30',
  margin,
  css,
  ...props
}: ISeparatorProps) {
  return (
    <SeparatorRoot
      {...props}
      className='Separator'
      css={{
        backgroundColor: color,
        margin:
          props.orientation === 'horizontal' ? `${margin} 0` : `0 ${margin}`,
        ...css,
      }}
      data-testid='separator'
    />
  );
}

export default React.memo(Separator);
