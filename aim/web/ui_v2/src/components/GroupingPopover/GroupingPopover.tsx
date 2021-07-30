import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Divider,
  TextField,
} from '@material-ui/core';
import {
  ExpandMore,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';

import StylePopoverAdvanced from 'pages/Metrics/components/StylePopoverAdvanced/StylePopoverAdvanced';
import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';

function GroupingPopover({
  groupName,
  selectOptions,
  selectedValues,
  advancedComponent,
  onSelect,
}: IGroupingPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function onChange(event: object, values: any, reason: string): void {
    onSelect({
      field: groupName,
      list: values.map((item: any) =>
        typeof item === 'string' ? item : item.name,
      ),
    });
  }

  function handleGroupingMode() {}

  function getOptionLabel(option: string): string {
    let split = option.split('.');
    return `${split[split.length - 2]}.${split[split.length - 1]}`;
  }

  const options: { name: string; group: string }[] = React.useMemo(() => {
    let data = [];
    for (let key in selectOptions) {
      for (let value of selectOptions[key as 'params']) {
        data.push({ name: `run.${key}.${value}`, group: key });
      }
    }
    return data;
  }, [selectOptions]);

  const values: { name: string; group: string }[] = React.useMemo(() => {
    let data: { name: string; group: string }[] = [];
    selectedValues.forEach((option: string) => {
      let split = option.split('.');
      data.push({ name: option, group: split[1] });
    });
    return data;
  }, [selectedValues]);

  return (
    <Box className='groupingPopover_container'>
      <Box p={0.5}>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          <Autocomplete
            id='select-metrics'
            size='small'
            multiple
            disableCloseOnSelect
            options={options}
            value={values}
            onChange={onChange}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => getOptionLabel(option.name)}
            getOptionSelected={(option, value) => option.name === value.name}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label='Select Metrics'
                placeholder='Select'
              />
            )}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox
                  icon={<CheckBoxOutlineBlank />}
                  checkedIcon={<CheckBoxIcon />}
                  style={{ marginRight: 4 }}
                  checked={selected}
                />
                {getOptionLabel(option.name)}
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
        {advancedComponent && (
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
        )}
      </Box>
    </Box>
  );
}

export default GroupingPopover;
