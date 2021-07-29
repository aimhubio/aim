import React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Chip,
  Divider,
  TextField,
} from '@material-ui/core';
import {
  ExpandMore,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';

import StylePopoverAdvanced from 'components/StylePopoverAdvanced/StylePopoverAdvanced';
import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IStylePopoverProps } from 'types/components/StylePopover/StylePopover';

function StylePopover({
  selectOptions,
  selectedValues,
  onSelect,
}: IStylePopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function onChange(event: object, values: any, reason: string): void {
    onSelect({ field: 'style', list: values });
  }

  function handleDelete(field: any): void {
    const listData: string[] = [...selectedValues].filter(
      (opt: any) => opt !== field,
    );
    onSelect({ field: 'style', list: listData });
  }

  function handleGroupingMode() {}

  return (
    <Box className='groupingPopover_container'>
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
        <Box className='popover_toggleMode__div'>
          <h3>select grouping mode</h3>
          <ToggleButton
            id='groupMode'
            leftLabel='Group'
            rightLabel='Reverse'
            onChange={handleGroupingMode}
          />
        </Box>
        <Accordion className='popover_accordion__container'>
          <AccordionSummary
            style={{ padding: '0 0.5em' }}
            expandIcon={<ExpandMore />}
            id='panel1c-header'
          >
            <span>Advanced options</span>
          </AccordionSummary>
          <AccordionDetails style={{ padding: 0 }}>
            <StylePopoverAdvanced />
          </AccordionDetails>
          <Divider />
        </Accordion>
      </Box>
    </Box>
  );
}

export default StylePopover;
