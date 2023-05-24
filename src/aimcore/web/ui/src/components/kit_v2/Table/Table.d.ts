import * as React from 'react';

export interface TableProps {
  data: Record<string, any[]>;
  className?: string;
  withSelect?: boolean;
  selectedIndices?: number[];
  focusedRowIndex?: number;
  onRowSelect?: (rowDict: Record<string, any>[]) => void;
  onRowFocus?: (focusedRow: Record<string, any>) => void;
}

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
  isFocused?: boolean;
}
