// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';

export const Alignment = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

export const FrozenDirection = {
  LEFT: 'left',
  RIGHT: 'right',
  DEFAULT: true,
  NONE: false,
};

/**
 * Column for BaseTable
 */
class Column extends React.Component {}

Column.Alignment = Alignment;
Column.FrozenDirection = FrozenDirection;

export default Column;
