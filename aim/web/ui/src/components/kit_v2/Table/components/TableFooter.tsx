import * as React from 'react';
import classNames from 'classnames';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
  /* eslint-disable react/prop-types */
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={classNames('TableFooter', className)}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';
export default TableFooter;
