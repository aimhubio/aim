import React from 'react';
import { Chip } from '@material-ui/core';
import { IBadgeProps } from './Badge.d';

import { Icon } from '../index';

import './Badge.scss';

/**
 * @property {string} id - id of Badge
 * @property {string} label - label of Badge
 * @property {string} color - Badge color
 * @property {string} size - size of Badge
 * @property {string} startIcon - Icon on front of Badge label
 * @property {'default' | 'outlined'} variant - variant of Badge
 * @property {maxWidth} string - maximum width of Badge
 * @property {React.CSSProperties} style - applies inline styles
 * @property {string} className - component className
 * @property {boolean} selectBadge - defines if Badge renders in Select component
 * @property {function} onDelete - delete callBack function
 * @property {function}  onClick - handling on Badge click function
 */

function Badge({
  id,
  label,
  color,
  size = 'medium',
  startIcon,
  variant = 'default',
  maxWidth = 'auto',
  style,
  className = '',
  selectBadge,
  onDelete,
  onClick,
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
      className={`Badge Badge${'__' + size} ${className} ${
        color ? '' : 'Badge__default'
      } ${selectBadge ? 'Badge__select' : ''}`}
      variant={variant}
      label={label}
      data-name={label}
      icon={
        startIcon && (
          <span className='Badge__icon__wrapper '>
            <Icon color={color} name={startIcon} />
          </span>
        )
      }
      deleteIcon={
        <span className='Badge__delete__icon__wrapper'>
          <Icon color={color} name='close' />
        </span>
      }
      {...(onDelete && { onDelete: () => onDelete(label) })}
      onClick={onClick}
    />
  );
}

export default Badge;
