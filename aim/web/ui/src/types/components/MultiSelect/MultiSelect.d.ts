import React from 'react';

import { SelectProps } from '@material-ui/core';

export default interface IMultiSelectProps extends SelectProps {
  values: any[];
  label?: string | number | React.ReactNode;
  labelId?: string;
  options: any[];
  formClassName?: string;
  id?: string;
  menuListHeight?: number;
  onSelect:
    | ((
        event: React.ChangeEvent<{
          name?: string | undefined;
          value: unknown;
        }>,
        child: React.ReactNode,
      ) => void)
    | undefined;
  renderValue: (selected) => any;
}
