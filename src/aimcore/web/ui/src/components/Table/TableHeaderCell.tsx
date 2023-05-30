// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

/**
 * HeaderCell component for BaseTable
 */
const TableHeaderCell = ({ className, column, columnIndex }) => (
  <ErrorBoundary>
    <div className={className}>{column.title}</div>
  </ErrorBoundary>
);

export default TableHeaderCell;
