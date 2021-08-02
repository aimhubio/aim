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

import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';
import { groupNames } from 'types/services/models/metrics/metricsAppModel';

function GroupingPopover({
  groupName,
  advancedComponent,
  groupingData,
  onSelect,
  onGroupingModeChange,
}: IGroupingPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function onChange(event: object, values: any, reason: string): void {
    onSelect({
      field: groupName,
      list: values.map((item: any) =>
        typeof item === 'string' ? item : item.name,
      ),
    });
  }

  function getOptionLabel(option: string): string {
    let split = option.split('.');
    return `${split[split.length - 2]}.${split[split.length - 1]}`;
  }

  const options: { name: string; group: string }[] = React.useMemo(() => {
    let data = [];
    for (let value of groupingData.selectOptions) {
      data.push({ name: value, group: value.split('.')[1] });
    }
    return data;
  }, [groupingData]);

  const values: { name: string; group: string }[] = React.useMemo(() => {
    let data: { name: string; group: string }[] = [];
    groupingData?.[groupName as groupNames].forEach((option: string) => {
      let split = option.split('.');
      data.push({ name: option, group: split[1] });
    });
    return data;
  }, [groupName, groupingData]);

  function handleGroupingMode(
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) {
    onGroupingModeChange({
      field: groupName,
      value: checked,
      options: groupingData.reverseMode[groupName as groupNames]
        ? options
        : null,
    });
  }

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
            value={groupingData.reverseMode[groupName as groupNames]}
            leftLabel='Group'
            rightLabel='Reverse'
            defaultChecked={groupingData.reverseMode[groupName as groupNames]}
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
              {advancedComponent}
            </AccordionDetails>
            <Divider />
          </Accordion>
        )}
      </Box>
    </Box>
  );
}

export default GroupingPopover;
