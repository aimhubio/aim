import React from 'react';
import { Box, Checkbox, Chip, TextField } from '@material-ui/core';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';

import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IDivideChartsPopoverProps } from 'types/components/DivideChartsPopover/DivideChartsPopover';

function DivideChartsPopover({
  onSelect,
  selectOptions,
  selectedValues,
}: IDivideChartsPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function onChange(event: object, values: any, reason: string): void {
    onSelect({ field: 'chart', list: values });
  }

  function handleDelete(field: any): void {
    const listData: string[] = [...selectedValues].filter(
      (opt: any) => opt !== field,
    );
    onSelect({ field: 'chart', list: listData });
  }

  function handleGroupingMode() {}

  return (
    <Box width='25em' className='groupingPopover_container'>
      <Box p={0.5}>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          <Autocomplete
            style={{ marginTop: '8px' }}
            id='color'
            size='small'
            multiple
            disableCloseOnSelect
            options={selectOptions}
            value={selectedValues}
            onChange={onChange}
            // groupBy={(option) => option.group}
            getOptionLabel={(option) => option}
            renderTags={() => {
              return (
                <Box className='selectForm__tags'>
                  {selectedValues.map((tag: string) => {
                    return (
                      <Box
                        component='span'
                        display='inline-block'
                        key={tag}
                        mr={0.5}
                        mt={0.25}
                      >
                        <Chip
                          size='small'
                          label={tag}
                          data-name={tag}
                          onDelete={() => handleDelete(tag)}
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
                {option}
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
