import * as React from 'react';
import classNames from 'classnames';

import { TableRowStyled } from '../Table.style';
import { TableRowProps } from '../Table.d';

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, isFocused, ...props }, ref) => (
    <TableRowStyled
      ref={ref}
      isFocused={isFocused}
      className={classNames('TableRow', className)}
      {...props}
    />
  ),
);

TableRow.displayName = 'TableRow';
export default TableRow;
