import React from 'react';
import {
  Box,
  Checkbox,
  Divider,
  TextField,
  Typography,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import ToggleButton from 'components/ToggleButton/ToggleButton';

import { ITooltipContentPopoverProps } from 'types/components/TooltipContentPopover/TooltipContentPopover';
import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import './TooltipContentPopover.scss';

function TooltipContentPopover({
  onChangeTooltip,
  selectedParams,
  displayTooltip,
  selectOptions,
}: ITooltipContentPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const onSelectedParamsChange = React.useCallback(
    (e: object, values: IGroupingSelectOption[]): void => {
      onChangeTooltip({
        selectedParams: values.map((item: IGroupingSelectOption) =>
          typeof item === 'string' ? item : item.value,
        ),
      });
    },
    [onChangeTooltip, selectedParams],
  );

  const onDisplayTooltipChange = React.useCallback(
    (e: React.ChangeEvent<any>, checked: boolean): void => {
      onChangeTooltip({ [e.target.id]: checked });
    },
    [onChangeTooltip],
  );

  const values: IGroupingSelectOption[] = React.useMemo(() => {
    let data: { value: string; group: string; label: string }[] = [];
    selectOptions.forEach((option) => {
      if (selectedParams.indexOf(option.value) !== -1) {
        data.push(option);
      }
    });
    return data;
  }, [selectOptions, selectedParams]);

  const paramsOptions = React.useMemo(() => {
    return selectOptions.filter((option) => option.group === 'params');
  }, [selectOptions]);

  return (
    <div className='TooltipContentPopover__container'>
      <Box p={0.5}>Select Tooltip Params:</Box>
      <Divider />
      <div className='TooltipContentPopover__params'>
        <Box borderRadius={4} border='1px solid #B7B7B7' p={0.5}>
          <Autocomplete
            id='select-params'
            size='small'
            multiple
            disableCloseOnSelect
            options={paramsOptions}
            value={values}
            onChange={onSelectedParamsChange}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label='Select Params'
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
                <Typography noWrap={true} title={option.label}>
                  {option.label}
                </Typography>
              </React.Fragment>
            )}
          />
        </Box>
        <Divider />
        <Box className='TooltipContentPopover__toggle'>
          <h3>Display tooltip</h3>
          <ToggleButton
            id='display'
            checked={displayTooltip}
            leftLabel='Hide'
            rightLabel='Show'
            onChange={onDisplayTooltipChange}
          />
        </Box>
      </div>
    </div>
  );
}

export default React.memo(TooltipContentPopover);
