import React from 'react';
import { Chip } from '@material-ui/core';

import { ISelectTagProps } from 'types/components/SelectTag/SelectTag';

import './SelectTag.scss';

function SelectTag({
  label,
  color,
  onDelete,
}: ISelectTagProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Chip
      style={{
        backgroundColor: `${color}1a`,
        color: color,
      }}
      size='small'
      className='SelectForm__tags__item'
      label={label}
      data-name={label}
      deleteIcon={
        <i
          style={{
            color: color,
          }}
          className='icon-delete'
        />
      }
      onDelete={() => (onDelete ? onDelete(label) : null)}
    />
  );
}

export default React.memo(SelectTag);
