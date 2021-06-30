import React from 'react';
import {
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
    <FormControl fullWidth size='small' variant='outlined'>
      <InputLabel id='mutiple-checkbox-label'>{props.label}</InputLabel>
      <Select
        variant='outlined'
        labelId='mutiple-checkbox-label'
        id='mutiple-checkbox'
        multiple
        value={props.value}
        onChange={props.handleChange}
        input={<Input />}
        // renderValue={(selected) => selected.join(', ')}
        // MenuProps={MenuProps}
      >
        {props.options.map((name) => (
          <MenuItem key={name} value={name}>
            {/* <Checkbox checked={personName.indexOf(name) > -1} /> */}
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default React.memo(MultiSelect);
