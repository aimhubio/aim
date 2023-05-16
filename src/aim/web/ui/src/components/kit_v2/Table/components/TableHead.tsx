import React from 'react';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} className={`${className} TableHead`} {...props} />
));

TableHead.displayName = 'TableHead';
export default TableHead;
