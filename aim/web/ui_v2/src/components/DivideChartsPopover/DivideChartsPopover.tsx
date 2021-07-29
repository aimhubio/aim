import React from 'react';
import { Box, Checkbox, Chip, TextField } from '@material-ui/core';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';

import ToggleButton from 'components/ToggleButton/ToggleButton';
import { colorOptions } from 'utils/mockOptions';

function DivideChartsPopover(): React.FunctionComponentElement<React.ReactNode> {
  const [fields, setFields] = React.useState<any>([]);

  function onSelect(event: object, value: any, reason: string): void {
    setFields([...value]);
  }

  function handleDelete(field: any): void {
    let fieldData = [...fields].filter((opt: any) => opt.name !== field);
    setFields(fieldData);
  }

  function handleGroupingMode() {}

  return (
    <Box width='25em' className='groupingPopover_container'>
      <Box p={0.5}>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          <Autocomplete
            style={{ marginTop: '8px' }}
            id='select-fields'
            size='small'
            multiple
            disableCloseOnSelect
            options={colorOptions}
            value={fields}
            onChange={onSelect}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.name}
            renderTags={() => {
              return (
                <Box className='selectForm__tags'>
                  {fields.map((tag: any) => {
                    return (
                      <Box
                        component='span'
                        display='inline-block'
                        key={tag.name}
                        mr={0.5}
                        mt={0.25}
                      >
                        <Chip
                          size='small'
                          label={tag.name}
                          data-name={tag.name}
                          onDelete={() => handleDelete(tag.name)}
                        />
                      </Box>
                    );
                  })}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label='Select Fields'
                placeholder='Select'
              />
            )}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox
                  icon={<CheckBoxOutlineBlank fontSize='small' />}
                  checkedIcon={<CheckBoxIcon fontSize='small' />}
                  style={{ marginRight: 4 }}
                  checked={selected}
                />
                {option.name}
              </React.Fragment>
            )}
          />
        </Box>
        <Box
          display='flex'
          alignItems='center'
          borderRadius={4}
          flexDirection='column'
          border='1px solid #B7B7B7'
          mt={0.5}
          mb={0.5}
          p={0.5}
        >
          <h3>select dividing mode</h3>
          <ToggleButton
            id='groupMode'
            leftLabel='Divide'
            rightLabel='Reverse'
            onChange={handleGroupingMode}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default DivideChartsPopover;
