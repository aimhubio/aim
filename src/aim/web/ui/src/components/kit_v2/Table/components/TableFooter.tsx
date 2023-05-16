import React from 'react';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={`${className} TableFooter `} {...props} />
));

TableFooter.displayName = 'TableFooter';
export default TableFooter;
