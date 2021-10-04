import React, { CSSProperties } from 'react';

export interface IIconProps extends React.BaseHTMLAttributes<any> {
  name: IconName;
  className?: string;
  style?: CSSProperties;
  fontSize?: number | string;
  color?: string;
}

export type IconName =
  | 'close-rectangle'
  | 'close'
  | 'eye-fill-show'
  | 'eye-outline-hide'
  | 'eye-show-outline'
  | 'eye-fill-hide'
  | 'row-height-down'
  | 'reset-width-outside'
  | 'reset-width-inside'
  | 'row-height-up'
  | 'pin-right'
  | 'pin-left'
  | 'pin'
  | 'expand-horizontal'
  | 'expand-vertical'
  | 'arrow-up'
  | 'arrow-left'
  | 'arrow-down'
  | 'arrow-right'
  | 'manage-calumn'
  | 'long-arrow-right'
  | 'long-arrow-left'
  | 'cursor'
  | 'delete'
  | 'sort-inside'
  | 'sort-outside'
  | 'params'
  | 'metrics'
  | 'tags'
  | 'bookmarks'
  | 'runs'
  | 'back-left'
  | 'back-down'
  | 'back-up'
  | 'back-right'
  | 'back-up-right'
  | 'back-up-left'
  | 'back-down-left'
  | 'back-down-right'
  | 'more-horizontal'
  | 'more-vertical'
  | 'drag'
  | 'move-to-left'
  | 'move-to-right'
  | 'reset'
  | 'line-style'
  | 'chart-group'
  | 'coloring'
  | 'zoom-in'
  | 'ignore-outliers'
  | 'smoothing'
  | 'highlight-mode'
  | 'axes-scale'
  | 'x-axis'
  | 'indicator'
  | 'aggregation'
  | 'zoom-out'
  | 'collapse-inside'
  | 'collapse-outside'
  | 'arrow-bidirectional-close'
  | 'arrow-bidirectional-open'
  | 'row-height'
  | 'Row-height-up'
  | 'copy'
  | 'menu'
  | 'download'
  | 'upload'
  | 'edit'
  | 'search-info'
  | 'search'
  | 'table-resize-maximize'
  | 'table-resize-hide'
  | 'table-resize-resizable'
  | 'plus'
  | 'Runs'
  | 'check-rectangle'
  | 'check-circle'
  | 'check'
  | 'link'
  | 'images'
  | 'sort-arrow-up'
  | 'sort-arrow-down';
