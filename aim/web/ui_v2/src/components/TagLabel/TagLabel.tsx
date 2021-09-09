import React from 'react';

import { Chip } from '@material-ui/core';
import Icon from '../Icon/Icon';
import { ITagLabelProps } from 'types/components/SelectTag/SelectTag';

import './TagLabel.scss';

function TagLabel({
  label,
  color,
  onDelete,
}: ITagLabelProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Chip
      style={{
        backgroundColor: `${color}1a`,
        color: color,
        border: `0.0625rem solid ${color}`,
      }}
      size='small'
      className='TagLabel'
      label={label}
      data-name={label}
      deleteIcon={<Icon color={color} name='close' />}
      {...(onDelete && { onDelete: () => onDelete(label) })}
    />
  );
}

export default TagLabel;
