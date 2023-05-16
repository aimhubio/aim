import React from 'react';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={`${className} TableHeader`} {...props} />
));

TableHeader.displayName = 'TableHeader';
export default TableHeader;
