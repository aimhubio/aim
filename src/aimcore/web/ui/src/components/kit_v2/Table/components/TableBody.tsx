import * as React from 'react';
import classNames from 'classnames';

import { TableBodyStyled } from '../Table.style';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <TableBodyStyled
    ref={ref}
    className={classNames('TableBody', className)}
    {...props}
  />
));

TableBody.displayName = 'TableBody';
export default TableBody;
