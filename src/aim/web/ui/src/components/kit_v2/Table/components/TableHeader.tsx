import * as React from 'react';
import classNames from 'classnames';

import { TableHeaderStyled } from '../Table.style';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <TableHeaderStyled
    ref={ref}
    className={classNames('TableHeader', className)}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';
export default TableHeader;
