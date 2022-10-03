import * as React from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import { Tooltip } from '@material-ui/core';

import { Icon, Text } from 'components/kit';

import hexToRgbA from 'utils/hexToRgbA';

import { IStatisticsCardProps } from './index';

import './StatisticsCard.scss';

function StatisticsCard({
  label,
  title = '',
  count,
  icon,
  iconBgColor = '#000000',
  cardBgColor = hexToRgbA(iconBgColor, 0.1),
  onMouseOver,
  onMouseLeave,
  navLink,
  highlighted,
  outlined = false,
  isLoading = false,
}: IStatisticsCardProps) {
  const history = useHistory();
  const onSafeMouseOver = React.useCallback(
    (id: string) => {
      if (typeof onMouseOver === 'function') {
        onMouseOver(id, 'card');
      }
    },
    [onMouseOver],
  );
  const renderCount = isLoading ? '--' : count;
  const styles = {
    card: {
      borderColor: `${outlined ? iconBgColor : 'transparent'}`,
      backgroundColor: highlighted ? iconBgColor : cardBgColor,
    },
    iconWrapper: {
      backgroundColor: highlighted ? '#fff' : iconBgColor,
    },
    iconColor: highlighted ? iconBgColor : '#fff',
    label: highlighted ? { color: '#fff' } : {},
    count: highlighted ? { color: '#fff' } : {},
  };
  return (
    <Tooltip title={title} placement='top'>
      <div
        onClick={() => navLink && history.push(navLink)}
        onMouseLeave={onMouseLeave}
        onMouseOver={() => onSafeMouseOver(label)}
        className={classNames('StatisticsCard', { highlighted })}
        style={styles.card}
      >
        {icon && (
          <div
            className='StatisticsCard__iconWrapper'
            style={styles.iconWrapper}
          >
            <Icon name={icon} color={styles.iconColor} />
          </div>
        )}
        <div className='StatisticsCard__info'>
          <Text
            className='StatisticsCard__info__label'
            size={10}
            weight={600}
            style={styles.label}
          >
            {label}
          </Text>
          <Tooltip title={renderCount}>
            <Text
              className='StatisticsCard__info__count'
              size={16}
              weight={600}
              style={styles.count}
            >
              {renderCount}
            </Text>
          </Tooltip>
        </div>
      </div>
    </Tooltip>
  );
}

StatisticsCard.displayName = 'StatisticsCard';

export default React.memo(StatisticsCard);
