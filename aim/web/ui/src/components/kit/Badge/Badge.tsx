import React from 'react';
import { Chip } from '@material-ui/core';
import { IBadgeProps } from './Badge.d';

import { Icon } from '../index';

import './Badge.scss';

function Badge({
  id,
  label,
  color,
  iconName,
  variant = 'default',
  onDelete,
  onClick,
  size = 'medium',
  maxWidth = 'auto',
  style,
  className = '',
}: IBadgeProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Chip
      id={id}
      style={{
        backgroundColor: `${color}1a`,
        color,
        border: `0.0625rem solid ${color}`,
        maxWidth,
        ...style,
      }}
      size='small'
      className={`Badge Badge${'__' + size} ${className}`}
      variant={variant}
      label={label}
      data-name={label}
      icon={iconName && <Icon color={color} name={iconName} />}
      deleteIcon={<Icon color={color} name='close' />}
      {...(onDelete && { onDelete: () => onDelete(label) })}
      onClick={onClick}
    />
  );
}

export default Badge;
