// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { toString } from './utils';

/**
 * Cell component for BaseTable
 */
const TableCell = ({
  className,
  cellData,
  column,
  columnIndex,
  rowData,
  rowIndex,
}) => (
  <ErrorBoundary>
    <div className={className}>
      {React.isValidElement(cellData) ? cellData : toString(cellData)}
    </div>
  </ErrorBoundary>
);

export default TableCell;
