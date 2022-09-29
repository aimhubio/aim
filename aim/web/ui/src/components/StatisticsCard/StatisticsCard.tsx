import * as React from 'react';
import classNames from 'classnames';

import { Icon, Text } from 'components/kit';

import hexToRgbA from 'utils/hexToRgbA';

import { IStatisticsCardProps } from '.';

import './StatisticsCard.scss';

function StatisticsCard({
  label,
  count,
  icon,
  iconBgColor = '#fff',
  cardBgColor = hexToRgbA(iconBgColor, 0.1),
  onMouseOver,
  onMouseLeave,
  highlighted,
}: IStatisticsCardProps) {
  const onSafeMouseOver = React.useCallback(
    (id: string) => {
      if (typeof onMouseOver === 'function') {
        onMouseOver(id);
      }
    },
    [onMouseOver],
  );
  return (
    <div
      onMouseLeave={onMouseLeave}
      onMouseOver={() => onSafeMouseOver(label)}
      className={classNames('StatisticsCard', { highlighted })}
      style={{ backgroundColor: cardBgColor }}
    >
      {icon && (
        <div
          className='StatisticsCard__iconWrapper'
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className='StatisticsCard__iconWrapper__icon' name={icon} />
        </div>
      )}
      <div className='StatisticsCard__info'>
        <Text
          className='StatisticsCard__info__label'
          size={10}
          weight={600}
          title={`${label}`}
        >
          {label}
        </Text>
        <Text
          className='StatisticsCard__info__count'
          size={16}
          weight={600}
          title={`${count}`}
        >
          {count}
        </Text>
      </div>
    </div>
  );
}

StatisticsCard.displayName = 'StatisticsCard';

export default React.memo(StatisticsCard);
