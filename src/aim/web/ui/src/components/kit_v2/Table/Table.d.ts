import * as React from 'react';

export interface TableProps {
  data: Record<string, any[]>;
  className?: string;
  withSelect?: boolean;
  selectedIndices?: number[];
  focusedRowIndex?: number;
}

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
  isFocused?: boolean;
}
