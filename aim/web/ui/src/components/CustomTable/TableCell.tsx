// @ts-nocheck
/* eslint-disable react/prop-types */

import classNames from 'classnames';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

function Cell({
  index,
  item,
  className,
  isConfigColumn,
  metadata,
  placeholder,
  col,
  onRowHover,
  onRowClick,
  multiSelect = false,
}) {
  return (
    <ErrorBoundary>
      <div
        className={classNames('Table__cell', {
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
            typeof onRowClick === 'function' ||
            (typeof item === 'object' && item?.props?.onClick)
              ? 'pointer'
              : 'inherit',
          ...(metadata?.color && {
            boxShadow: `inset 3px 0 0 0 ${metadata.color}`,
          }),
          ...(typeof item === 'object' &&
            item?.hasOwnProperty('style') &&
            item?.style),
        }}
        {...(typeof item === 'object' && item?.props)}
        onMouseMove={
          item?.props?.onMouseMove ? item.props.onMouseMove : onRowHover
        }
        onClick={item?.props?.onClick ? item.props.onClick : onRowClick}
      >
        {isConfigColumn || placeholder ? (
          <>{multiSelect && item}</>
        ) : (
          <div className='Table__cell__value'>
            {typeof item === 'object' && item?.hasOwnProperty('content')
              ? item?.content ?? ''
              : item ?? ''}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default Cell;
