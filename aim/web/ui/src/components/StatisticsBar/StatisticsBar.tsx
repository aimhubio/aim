import * as React from 'react';
import classNames from 'classnames';

import { IBarStyle, IStatisticsBarProps } from '.';

import './StatisticsBar.scss';

function StatisticsBar({
  data = [],
  width = '100%',
  height = 8,
  onMouseOver,
  onMouseLeave,
}: IStatisticsBarProps) {
  const onSafeMouseOver = React.useCallback(
    (id: string) => {
      if (typeof onMouseOver === 'function') {
        onMouseOver(id);
      }
    },
    [onMouseOver],
  );
  const barStyles = React.useMemo(() => {
    const styles: IBarStyle[] = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const prevItemLeftPos = styles[i - 1]?.left || 0;
      const prevItemPercent = data[i - 1]?.percent || 0;
      const style = {
        width: `${item.percent.toFixed(2)}%`,
        left: i === 0 ? 0 : prevItemLeftPos + prevItemPercent,
        backgroundColor: item.color,
        color: item.color,
      };
      styles.push(style);
    }
    return styles;
  }, [data]);
  return (
    <div className='StatisticsBar' style={{ width, height }}>
      {Object.values(data).map((item, i) => (
        <span
          key={`${item.label}-${item.color}`}
          title={`${item.label}`}
          className={classNames('StatisticsBar__item', {
            highlighted: item.percent && item.highlighted,
          })}
          style={{ ...barStyles[i], left: barStyles[i].left + '%' }}
          onMouseLeave={onMouseLeave}
          onMouseOver={() => onSafeMouseOver(item.label || '')}
        />
      ))}
    </div>
  );
}

StatisticsBar.displayName = 'StatisticsBar';

export default React.memo(StatisticsBar);
