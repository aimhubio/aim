import React from 'react';
import {
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Box,
  Checkbox,
  Chip,
  TextField,
  Divider,
} from '@material-ui/core';
import ToggleButton from 'components/ToggleButton/ToggleButton';

import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
  ExpandMore,
} from '@material-ui/icons';
import ColorPopoverAdvanced from 'components/ColorPopoverAdvanced/ColorPopoverAdvanced';
import { IColorPopoverProps } from 'types/components/ColorPopover/ColorPopover';

function ColorPopover({
  selectOptions,
  selectedValues,
  onSelect,
}: IColorPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const [selectedPersistence, setSelectedPersistence] = React.useState(0);

  const onPaletteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPersistence(+event.target.value);
  };

  function onChange(event: object, values: any, reason: string): void {
    onSelect({ field: 'color', list: values });
  }

  function handleDelete(field: string): void {
    const listData: string[] = [...selectedValues].filter(
      (opt: any) => opt !== field,
    );
    console.log();

    onSelect({ field: 'color', list: listData });
  }

  function handleGroupingMode() {}
  function onPersistenceChange() {}

  return (
    <Box className='groupingPopover_container'>
      <Box p={0.5}>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          <h3>Select fields for grouping by color</h3>
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
            <ColorPopoverAdvanced
              onPaletteChange={onPaletteChange}
              onPersistenceChange={onPersistenceChange}
              selectedPersistence={selectedPersistence}
            />
          </AccordionDetails>
          <Divider />
        </Accordion>
      </Box>
    </Box>
  );
}

export default ColorPopover;
