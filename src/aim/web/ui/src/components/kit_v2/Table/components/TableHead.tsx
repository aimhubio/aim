import classNames from 'classnames';
import React from 'react';

import { TableHeadStyled } from '../Table.style';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableHeadStyled
    ref={ref}
    className={classNames('TableHead', className)}
    {...props}
  />
));

TableHead.displayName = 'TableHead';
export default TableHead;
