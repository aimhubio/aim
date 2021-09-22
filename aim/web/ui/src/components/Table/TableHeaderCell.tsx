// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';

/**
 * HeaderCell component for BaseTable
 */
const TableHeaderCell = ({ className, column, columnIndex }) => (
  <div className={className}>{column.title}</div>
);

export default TableHeaderCell;
