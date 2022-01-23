import React from 'react';

import { Checkbox, Divider, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { ToggleButton, Badge, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ITooltipContentPopoverProps } from 'types/components/TooltipContentPopover/TooltipContentPopover';
import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import './TooltipContentPopover.scss';

function TooltipContentPopover({
  onChangeTooltip,
  selectedParams,
  displayTooltip,
  selectOptions,
}: ITooltipContentPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  let [inputValue, setInputValue] = React.useState('');

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
    <ErrorBoundary>
      <div className='TooltipContentPopover'>
        <div className='TooltipContentPopover__section'>
          <Text
            component='h4'
            tint={50}
            className='TooltipContentPopover__subtitle'
          >
            Parameters
          </Text>
          <Autocomplete
            id='select-params'
            size='small'
            multiple
            disableCloseOnSelect
            options={
              inputValue.trim() !== ''
                ? paramsOptions
                    .slice()
                    .sort(
                      (a, b) =>
                        a.label.indexOf(inputValue) -
                        b.label.indexOf(inputValue),
                    )
                : paramsOptions
            }
            value={values}
            onChange={onSelectedParamsChange}
            onInputChange={(e, value) => setInputValue(value)}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                placeholder='Select Params'
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
        <Divider className='TooltipContentPopover__Divider' />
        <div className='TooltipContentPopover__section'>
          <Text
            component='h4'
            tint={50}
            className='TooltipContentPopover__subtitle'
          >
            Toggle Chart Tooltip Visibility
          </Text>
          <ToggleButton
            title='Select Mode'
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
    </ErrorBoundary>
  );
}

export default React.memo(TooltipContentPopover);
