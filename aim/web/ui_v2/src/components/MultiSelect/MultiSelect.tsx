import React from 'react';
import {
  Checkbox,
  FormControl,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@material-ui/core';

import IMultiSelectProps from 'types/components/MultiSelect/MultiSelect';

function MultiSelect(
  props: IMultiSelectProps,
): React.FunctionComponentElement<React.ReactNode> {
  return (
    <FormControl
      variant={props.variant || 'outlined'}
      className={props.formClassName || ''}
    >
      {props.label && <InputLabel id={props.labelId}>{props.label}</InputLabel>}
      <Select
        labelId={props.labelId || ''}
        id={props.id || ''}
        multiple={true}
        value={props.values}
        onChange={props.onSelect}
        defaultValue={props.defaultValue || ''}
        input={<Input />}
        renderValue={props.renderValue}
        variant={props.variant || 'outlined'}
        MenuProps={{
          PaperProps: {
            style: {
              height: props.menuListHeight || 300,
            },
          },
        }}
        displayEmpty
      >
        {props.options.map((value) => (
          <MenuItem key={value} value={value}>
            <Checkbox checked={props.values.indexOf(value) > -1} />
            <ListItemText primary={value} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default React.memo(MultiSelect);
