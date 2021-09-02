// @ts-nocheck
/* eslint-disable react/prop-types */

import React from 'react';
import classNames from 'classnames';

function Cell({
  index,
  item,
  className,
  isConfigColumn,
  groupLength,
  metadata,
  placeholder,
  col,
  onRowHover,
  onRowClick,
}) {
  return (
    <div
      className={classNames({
        Table__cell: true,
        [`${typeof item === 'object' && item?.className}`]: true,
        [className]: !!className,
        [`index-${index}`]: true,
        [col.key]: true,
        Table__group__config__column__cell: isConfigColumn,
        clickable: typeof item === 'object' && !!item?.props?.onClick,
        placeholder: !!placeholder,
      })}
      style={{
        cursor:
          typeof item === 'object' && item?.props?.onClick
            ? 'pointer'
            : 'inherit',
        ...(typeof item === 'object' &&
          item?.hasOwnProperty('style') &&
          item?.style),
      }}
      {...(typeof item === 'object' && item?.props)}
      onMouseMove={onRowHover}
      onClick={item?.props?.onClick ? item.props.onClick : onRowClick}
    >
      {metadata && <div className='Table__cell__rowMeta'>{metadata}</div>}
      {isConfigColumn || placeholder ? (
        ''
      ) : (
        <div className='Table__cell__value'>
          {typeof item === 'object' && item?.hasOwnProperty('content')
            ? JSON.stringify(item?.content ?? '')
            : JSON.stringify(item ?? '')}
        </div>
      )}
    </div>
  );
}

export default Cell;
