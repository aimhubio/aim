// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import cn from 'classnames';

import SortOrder from './SortOrder';

/**
 * default SortIndicator for BaseTable
 */
const SortIndicator = ({ sortOrder, className, style }) => {
  const cls = cn('BaseTable__sort-indicator', className, {
    'BaseTable__sort-indicator--descending': sortOrder === SortOrder.DESC,
  });
  return (
    <div
      className={cls}
      style={{
        userSelect: 'none',
        width: '16px',
        height: '16px',
        lineHeight: '16px',
        textAlign: 'center',
        ...style,
      }}
    >
      {sortOrder === SortOrder.DESC ? '\u2193' : '\u2191'}
    </div>
  );
};

export default SortIndicator;
