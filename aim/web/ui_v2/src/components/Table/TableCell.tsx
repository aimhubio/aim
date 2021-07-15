// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';

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
  <div className={className}>
    {React.isValidElement(cellData) ? cellData : toString(cellData)}
  </div>
);

export default TableCell;
