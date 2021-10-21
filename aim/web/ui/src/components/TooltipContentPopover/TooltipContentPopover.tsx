import React from 'react';
import { Checkbox, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { ToggleButton, Badge } from 'components/kit';

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
    [onChangeTooltip],
  );

  const onDisplayTooltipChange = React.useCallback(
    (value, id): void => {
      onChangeTooltip({ [id]: value === 'Show' });
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

    // Sort selected values by the order of their application
    return data.sort(
      (a, b) =>
        selectedParams.indexOf(a.value) - selectedParams.indexOf(b.value),
    );
  }, [selectOptions, selectedParams]);

  const paramsOptions = React.useMemo(() => {
    return selectOptions.filter((option) =>
      option.value.startsWith('run.params.'),
    );
  }, [selectOptions]);

  return (
    <div className='TooltipContentPopover__container'>
      <div className='TooltipContentPopover__params'>
        <div>
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
                  color='primary'
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
            renderTags={(value, getTagProps) => (
              <div style={{ maxHeight: 110, overflow: 'auto' }}>
                {value.map((selected, i) => (
                  <Badge
                    key={i}
                    {...getTagProps({ index: i })}
                    label={selected.label}
                    size='small'
                    className='Select__Chip'
                  />
                ))}
              </div>
            )}
          />
        </div>
        <div className='TooltipContentPopover__toggle'>
          <ToggleButton
            title='Display tooltip'
            id='display'
            value={displayTooltip ? 'Show' : 'Hide'}
            leftLabel='Hide'
            rightLabel='Show'
            leftValue={'Hide'}
            rightValue={'Show'}
            onChange={onDisplayTooltipChange}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(TooltipContentPopover);
