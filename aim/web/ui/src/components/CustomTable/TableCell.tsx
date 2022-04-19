// @ts-nocheck
/* eslint-disable react/prop-types */

import classNames from 'classnames';
import _ from 'lodash-es';

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
  groupColumnColored,
  getColumnCelBGColor,
  columnsColorScales,
  isNumeric,
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
          colorIndicator:
            (!isConfigColumn && metadata?.color) ||
            (!groupColumnColored && metadata?.color),
          groupColumnWithoutColor: !groupColumnColored,
          isNumeric: isNumeric,
        })}
        style={{
          cursor:
            typeof onRowClick === 'function' ||
            (typeof item === 'object' && item?.props?.onClick)
              ? 'pointer'
              : 'inherit',
          ...(metadata?.color && {
            '--color-indicator': metadata?.color,
          }),
          ...(getColumnCelBGColor &&
            columnsColorScales?.[col.key] &&
            !_.isNil(getColumnCelBGColor(item)) && {
              background: getColumnCelBGColor(+item),
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
          <div
            className={classNames('Table__cell__value', {
              hasColorIndicator: !isConfigColumn && metadata?.color,
              isNumeric,
            })}
          >
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
