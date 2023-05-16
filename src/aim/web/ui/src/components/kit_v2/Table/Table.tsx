import React from 'react';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref): any => (
  <div>
    <table ref={ref} className={`${className} Table`} {...props} />
  </div>
));

Table.displayName = 'Table';
export default Table;
