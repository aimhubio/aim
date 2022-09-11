import React from 'react';
import classNames from 'classnames';

function LogCell({
  columnIndex,
  rowIndex,
  style,
  data,
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    logsList: Array<string[]>;
    columnCount: number;
  };
}) {
  return (
    <div style={style}>
      <p
        className={classNames('LogCell__line', {
          [`rowIndex${rowIndex}`]: true,
          firstColumn: columnIndex === 0,
          lastColumn: columnIndex === data.columnCount - 1,
        })}
      >
        {data.logsList?.[rowIndex - 1]?.[columnIndex] ?? ''}
      </p>
    </div>
  );
}

LogCell.displayName = 'LogCell';

export default React.memo(LogCell);
