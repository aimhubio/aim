import * as React from 'react';

import { IBarStyle, IStatisticsBarProps } from '.';

import './StatisticsBar.scss';

function StatisticsBar({
  data = [],
  width = '100%',
  height = 8,
}: IStatisticsBarProps) {
  const renderBarItems = React.useCallback(() => {
    const styles: IBarStyle[] = [];
    const items = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const prevItemLeftPos = styles[i - 1]?.left || 0;
      const prevItemPercent = data[i - 1]?.percent || 0;
      const style = {
        width: `${item.percent}%`,
        left: i === 0 ? 0 : prevItemLeftPos + prevItemPercent,
        backgroundColor: item.color,
      };
      styles.push(style);
      items.push(
        <span
          key={`${item.label}-${item.color}`}
          className='StatisticsBar__item'
          style={{ ...style, left: style.left + '%' }}
        />,
      );
    }
    return items;
  }, [data]);
  return (
    <div className='StatisticsBar' style={{ width, height }}>
      {renderBarItems()}
    </div>
  );
}

StatisticsBar.displayName = 'StatisticsBar';

export default React.memo(StatisticsBar);
