import * as React from 'react';
import classNames from 'classnames';

import { TableCellStyled } from '../Table.style';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
  /* eslint-disable react/prop-types */
>(({ className, ...props }, ref) => (
  <TableCellStyled
    ref={ref}
    className={classNames('TableCell', className)}
    {...props}
  />
));

TableCell.displayName = 'TableCell';
export default TableCell;
