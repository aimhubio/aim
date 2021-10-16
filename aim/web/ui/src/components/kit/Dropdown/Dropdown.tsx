import React from 'react';
import { IDropdownProps } from '.';

import './Dropdown.scss';

function Dropdown({
  //   size,
  //   withOnlyIcon,
  //   color,
  //   children,
  ...rest
}: IDropdownProps): React.FunctionComponentElement<React.ReactNode> {
  //   const styleOverrides = {
  //     borderRadius: '0.375rem',
  //     padding: `0.5rem ${withOnlyIcon ? '0.5rem' : '1.25rem'}`,
  //     fontSize: fontSizes[size || 'medium'],
  //     height: sizes[size || 'medium'],
  //     minWidth: withOnlyIcon ? '2rem' : '4.375rem',
  //   };

  return <div></div>;
}

Dropdown.displayName = 'Dropdown';

export default React.memo<IDropdownProps>(Dropdown);
