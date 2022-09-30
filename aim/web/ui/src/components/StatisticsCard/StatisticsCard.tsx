import * as React from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';

import hexToRgbA from 'utils/hexToRgbA';

import { IStatisticsCardProps } from './index';

import './StatisticsCard.scss';

function StatisticsCard({
  label,
  title,
  count,
  icon,
  iconBgColor = '#fff',
  cardBgColor = hexToRgbA(iconBgColor, 0.1),
  onMouseOver,
  onMouseLeave,
  navLink,
  highlighted,
  disabled = false,
}: IStatisticsCardProps) {
  const history = useHistory();
  const onSafeMouseOver = React.useCallback(
    (id: string) => {
      if (!disabled && typeof onMouseOver === 'function') {
        onMouseOver(id);
      }
    },
    [onMouseOver],
  );
  return (
    <Tooltip title={title || ''}>
      <div
        onClick={() => !disabled && navLink && history.push(navLink)}
        onMouseLeave={onMouseLeave}
        onMouseOver={() => onSafeMouseOver(label)}
        className={classNames('StatisticsCard', {
          highlighted: navLink && highlighted,
        })}
        style={{
          backgroundColor: navLink && highlighted ? iconBgColor : cardBgColor,
        }}
      >
        {icon && (
          <div
            className='StatisticsCard__iconWrapper'
            style={{
              backgroundColor: navLink && highlighted ? '#fff' : iconBgColor,
            }}
          >
            <Icon className='StatisticsCard__iconWrapper__icon' name={icon} />
          </div>
        )}
        <div className='StatisticsCard__info'>
          <Text className='StatisticsCard__info__label' size={10} weight={600}>
            {label}
          </Text>
          <Tooltip title={`${count}`}>
            <Text
              className='StatisticsCard__info__count'
              size={16}
              weight={600}
            >
              {count}
            </Text>
          </Tooltip>
        </div>
      </div>
    </Tooltip>
  );
}

StatisticsCard.displayName = 'StatisticsCard';

export default React.memo(StatisticsCard);
