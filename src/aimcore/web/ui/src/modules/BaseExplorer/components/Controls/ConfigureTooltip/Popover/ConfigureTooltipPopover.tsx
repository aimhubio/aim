import React from 'react';
import _ from 'lodash-es';

import { Checkbox, Divider, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Badge, SelectDropdown, Text, ToggleButton } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary';
import { ISelectDropdownOption } from 'components/kit/SelectDropdown';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import { ITooltipConfig, TooltipAppearanceEnum } from '../index';

import { IConfigureTooltipPopoverProps } from './index';

import './ConfigureTooltipPopover.scss';

function ConfigureTooltipPopover(props: IConfigureTooltipPopoverProps) {
  const {
    visualizationName,
    engine: { useStore, visualizations, pipeline },
  } = props;
  const vizEngine = visualizations[visualizationName];
  const controls = vizEngine.controls;
  const tooltip: ITooltipConfig = useStore(controls.tooltip.stateSelector);
  const updateTooltipConfig = controls.tooltip.methods.update;
  const availableModifiers = useStore(pipeline.additionalDataSelector);

  const [searchValue, setSearchValue] = React.useState('');

  const allOptions = React.useMemo((): IGroupingSelectOption[] => {
    const modifiers = availableModifiers?.modifiers ?? [];
    return modifiers.map((modifier: string) => ({
      label: modifier,
      value: modifier,
      group: modifier.slice(0, modifier.indexOf('.')),
    }));
  }, [availableModifiers?.modifiers]);

  const options = React.useMemo((): IGroupingSelectOption[] => {
    return searchValue
      ? allOptions?.filter((option) => option.label.indexOf(searchValue) !== -1)
      : allOptions;
  }, [allOptions, searchValue]);

  const onSelectFieldsChange = React.useCallback(
    (values: IGroupingSelectOption[]): void => {
      updateTooltipConfig({
        selectedFields: values.map((item: IGroupingSelectOption) => item.value),
      });
    },
    [updateTooltipConfig],
  );

  const onChange = React.useCallback(
    (e: any, values: IGroupingSelectOption[]): void => {
      // skip Backspace if there is an input value to do not delete badge (the last selected field)
      if (e?.code === 'Backspace' && searchValue.length) {
        return;
      }
      onSelectFieldsChange(values);
    },
    [searchValue.length, onSelectFieldsChange],
  );

  const onSearchInputChange = React.useCallback(
    (e): void => {
      e.stopPropagation();
      setSearchValue(e.target.value);
    },
    [setSearchValue],
  );

  const onDisplayTooltipChange = React.useCallback((): void => {
    updateTooltipConfig({ display: !tooltip.display });
  }, [updateTooltipConfig, tooltip.display]);

  const onTooltipAppearanceChange = React.useCallback(
    (option: ISelectDropdownOption): void => {
      updateTooltipConfig({ appearance: option.value });
    },
    [updateTooltipConfig],
  );

  const tooltipAppearanceOptions = React.useMemo(
    (): ISelectDropdownOption[] =>
      Object.values(TooltipAppearanceEnum).map((option) => ({
        label: _.capitalize(option),
        value: option,
      })),
    [],
  );

  const values = React.useMemo((): IGroupingSelectOption[] => {
    const data: { value: string; group: string; label: string }[] = [];
    allOptions.forEach((option) => {
      if (tooltip.selectedFields.indexOf(option.value) !== -1) {
        data.push(option);
      }
    });

    // Sort selected values by the order of their application
    return data.sort(
      (a, b) =>
        tooltip.selectedFields.indexOf(a.value) -
        tooltip.selectedFields.indexOf(b.value),
    );
  }, [allOptions, tooltip.selectedFields]);

  return (
    <ErrorBoundary>
      <div className='TooltipPopover'>
        <div className='TooltipPopover__section'>
          <Text component='h4' tint={50} className='TooltipPopover__subtitle'>
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
            onChange={onChange}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps,
                  value: searchValue,
                  onChange: onSearchInputChange,
                }}
                className='TextField__OutLined__Small'
                variant='outlined'
                placeholder='Select Fields'
              />
            )}
            renderOption={(option, { selected }) => (
              <div className='TooltipPopover__option'>
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
              <div className='TooltipPopover__SelectedTagsContainer'>
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
        <Divider className='TooltipPopover__divider' />
        <div className='TooltipPopover__section'>
          <Text component='h4' tint={50} className='TooltipPopover__subtitle'>
            Tooltip Visibility On Hover
          </Text>
          <ToggleButton
            title='Select Visibility'
            id='display'
            value={tooltip.display ? 'Show' : 'Hide'}
            leftLabel='Hide'
            rightLabel='Show'
            leftValue='Hide'
            rightValue='Show'
            onChange={onDisplayTooltipChange}
          />
        </div>
        <Divider className='TooltipPopover__divider' />
        <div className='TooltipPopover__section'>
          <Text component='h4' tint={50} className='TooltipPopover__subtitle'>
            Tooltip Appearance
          </Text>
          <SelectDropdown
            selectOptions={tooltipAppearanceOptions}
            selected={tooltip.appearance}
            handleSelect={onTooltipAppearanceChange}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

ConfigureTooltipPopover.displayName = 'ConfigureTooltipPopover';

export default React.memo(ConfigureTooltipPopover);
