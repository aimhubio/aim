import React from 'react';
import _ from 'lodash-es';

import { Checkbox, Divider, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Badge, SelectDropdown, Text, ToggleButton } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { ISelectDropdownOption } from 'components/kit/SelectDropdown';

import { TooltipAppearanceEnum } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';

import { ITooltipContentPopoverProps } from 'types/components/TooltipContentPopover/TooltipContentPopover';
import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel.d';

import './TooltipContentPopover.scss';

function TooltipContentPopover({
  onChangeTooltip,
  selectedFields = [],
  tooltipAppearance = TooltipAppearanceEnum.Auto,
  isTooltipDisplayed = true,
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

  const onDisplayTooltipChange = React.useCallback((): void => {
    onChangeTooltip({ display: !isTooltipDisplayed });
  }, [onChangeTooltip, isTooltipDisplayed]);

  const onTooltipAppearanceChange = React.useCallback(
    (value): void => {
      onChangeTooltip({ appearance: value.value });
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

  const tooltipAppearanceOptions: ISelectDropdownOption[] =
    React.useMemo(() => {
      return Object.values(TooltipAppearanceEnum).map((option) => {
        return { label: _.capitalize(option), value: option };
      });
    }, []);

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
            openOnFocus
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
              <div className='TooltipContentPopover__option'>
                <Checkbox
                  color='primary'
                  size='small'
                  icon={<CheckBoxOutlineBlank />}
                  checkedIcon={<CheckBoxIcon />}
                  style={{ marginRight: 4 }}
                  checked={selected}
                />
                <Text className='GroupingPopover__option__label' size={14}>
                  {option.label}
                </Text>
              </div>
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
            Tooltip Visibility On Hover
          </Text>
          <ToggleButton
            title='Select Visibility'
            id='display'
            value={isTooltipDisplayed ? 'Show' : 'Hide'}
            leftLabel='Hide'
            rightLabel='Show'
            leftValue={'Hide'}
            rightValue={'Show'}
            onChange={onDisplayTooltipChange}
          />
        </div>
        <Divider className='TooltipContentPopover__Divider' />
        <div className='TooltipContentPopover__section'>
          <Text
            component='h4'
            tint={50}
            className='TooltipContentPopover__subtitle'
          >
            Tooltip Appearance
          </Text>
          <SelectDropdown
            selectOptions={tooltipAppearanceOptions}
            selected={tooltipAppearance}
            handleSelect={onTooltipAppearanceChange}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(TooltipContentPopover);
