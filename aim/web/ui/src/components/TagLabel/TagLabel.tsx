import React from 'react';
import { Chip } from '@material-ui/core';

import Icon from '../Icon/Icon';
import { ITagLabelProps } from 'types/components/TagLabel/TagLabel';

import './TagLabel.scss';

function TagLabel({
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
}: ITagLabelProps): React.FunctionComponentElement<React.ReactNode> {
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
      className={`${className} TagLabel TagLabel${'__' + size}`}
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

export default TagLabel;
