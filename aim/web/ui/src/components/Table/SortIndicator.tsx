// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import cn from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import SortOrder from './SortOrder';

/**
 * default SortIndicator for BaseTable
 */
const SortIndicator = ({ sortOrder, className, style }) => {
  const cls = cn('BaseTable__sort-indicator', className, {
    'BaseTable__sort-indicator--descending': sortOrder === SortOrder.DESC,
  });
  return (
    <ErrorBoundary>
      <div
        className={cls}
        style={{
          userSelect: 'none',
          width: '1em',
          height: '1em',
          lineHeight: '1em',
          textAlign: 'center',
          ...style,
        }}
      >
        {sortOrder === SortOrder.DESC ? '\u2193' : '\u2191'}
      </div>
    </ErrorBoundary>
  );
};

export default SortIndicator;
