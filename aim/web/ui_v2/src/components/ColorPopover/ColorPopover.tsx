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
import { colorOptions } from 'utils/mockOptions';

function ColorPopover(): React.FunctionComponentElement<React.ReactNode> {
  const [fields, setFields] = React.useState<any>([]);
  const [selectedPersistence, setSelectedPersistence] = React.useState(0);

  const onPaletteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPersistence(+event.target.value);
  };

  function onSelect(event: object, value: any, reason: string): void {
    setFields([...value]);
  }

  function handleDelete(field: any): void {
    let fieldData = [...fields].filter((opt: any) => opt.name !== field);
    setFields(fieldData);
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
