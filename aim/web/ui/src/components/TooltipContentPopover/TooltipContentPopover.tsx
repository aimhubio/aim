import React from 'react';

import { Checkbox, Divider, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Badge, Text, ToggleButton } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ITooltipContentPopoverProps } from 'types/components/TooltipContentPopover/TooltipContentPopover';
import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import './TooltipContentPopover.scss';

function TooltipContentPopover({
  onChangeTooltip,
  selectedFields,
  displayTooltip,
  selectOptions,
}: ITooltipContentPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  let [inputValue, setInputValue] = React.useState('');

  function onSelectedFieldsChange(
    e: any,
    values: IGroupingSelectOption[],
  ): void {
    if (e?.code !== 'Backspace') {
      handleSelect(values);
    } else {
      if (inputValue.length === 0) {
        handleSelect(values);
      }
    }
  }
  function handleSelect(values: IGroupingSelectOption[]) {
    onChangeTooltip({
      selectedFields: values.map((item: IGroupingSelectOption) =>
        typeof item === 'string' ? item : item.value,
      ),
    });
  }
  const onDisplayTooltipChange = React.useCallback(
    (value, id): void => {
      onChangeTooltip({ [id]: value === 'Show' });
    },
    [onChangeTooltip],
  );

  const values: IGroupingSelectOption[] = React.useMemo(() => {
    let data: { value: string; group: string; label: string }[] = [];
    selectOptions.forEach((option) => {
      if (selectedFields.indexOf(option.value) !== -1) {
        data.push(option);
      }
    });

    // Sort selected values by the order of their application
    return data.sort(
      (a, b) =>
        selectedFields.indexOf(a.value) - selectedFields.indexOf(b.value),
    );
  }, [selectOptions, selectedFields]);

  const options = React.useMemo(() => {
    if (inputValue.trim() !== '') {
      const filtered = selectOptions.filter((item) => {
        return item.label.indexOf(inputValue) !== -1;
      });

      return filtered
        .slice()
        .sort(
          (a, b) => a.label.indexOf(inputValue) - b.label.indexOf(inputValue),
        );
    }
    return selectOptions;
  }, [selectOptions, inputValue]);

  return (
    <ErrorBoundary>
      <div className='TooltipContentPopover'>
        <div className='TooltipContentPopover__section'>
          <Text
            component='h4'
            tint={50}
            className='TooltipContentPopover__subtitle'
          >
            Select Fields To Display In The Tooltip
          </Text>
          <Autocomplete
            id='select-params'
            size='small'
            multiple
            disableCloseOnSelect
            options={options}
            value={values}
            onChange={onSelectedFieldsChange}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps,
                  value: inputValue,
                  onChange: (e: any) => {
                    setInputValue(e.target.value);
                  },
                }}
                className='TextField__OutLined__Small'
                variant='outlined'
                placeholder='Select Fields'
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
              <div className='TooltipContentPopover__SelectedTagsContainer'>
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
