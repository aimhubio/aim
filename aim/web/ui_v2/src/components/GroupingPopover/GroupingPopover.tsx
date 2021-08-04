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
import {
  groupingSelectOption,
  groupNames,
} from 'types/services/models/metrics/metricsAppModel';

import './groupingPopoverStyle.scss';

function GroupingPopover({
  groupName,
  advancedComponent,
  groupingData,
  onSelect,
  onGroupingModeChange,
}: IGroupingPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function onChange(e: object, values: groupingSelectOption[]): void {
    onSelect({
      groupName,
      list: values.map((item: groupingSelectOption) =>
        typeof item === 'string' ? item : item.value,
      ),
    });
  }

  const values: groupingSelectOption[] = React.useMemo(() => {
    let data: { value: string; group: string; label: string }[] = [];
    groupingData.selectOptions.forEach((option) => {
      if (groupingData?.[groupName].indexOf(option.value) !== -1) {
        data.push(option);
      }
    });
    return data;
  }, [groupName, groupingData]);

  function handleGroupingMode(
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) {
    onGroupingModeChange({
      groupName,
      value: checked,
      options: groupingData.reverseMode[groupName as groupNames]
        ? groupingData.selectOptions
        : null,
    });
  }

  return (
    <Box className='GroupingPopover__container'>
      <Box p={0.5}>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          <Autocomplete
            id='select-metrics'
            size='small'
            multiple
            disableCloseOnSelect
            options={groupingData?.selectOptions}
            value={values}
            onChange={onChange}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.value === value.value}
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
                {option.label}
              </React.Fragment>
            )}
          />
        </Box>
        <Box className='GroupingPopover__toggleMode_div'>
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
          <Accordion className='GroupingPopover__accordion__container'>
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
