import React from 'react';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={`${className} TableBody `} {...props} />
));

TableBody.displayName = 'TableBody';
export default TableBody;
