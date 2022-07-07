import React from 'react';

import { TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteRenderInputParams } from '@material-ui/lab';

import { Text } from 'components/kit';

import {
  ISelectDropdownOption,
  ISelectDropdownProps,
} from './SelectDropdown.d';

import './SelectDropdown.scss';

/**
 * @property {ISelectDropdownOption[]} options - options for select dropdown
 * @property {Function} handleSelect - handle selected option
 * @property {string | undefined} selected - controlled select dropdown (optional)
 * @property {AutocompleteProps} rest - rest props for Autocomplete component
 * @property {React.HTMLElement} children - children element
 */

function SelectDropdown({
  options = [],
  handleSelect,
  selected,
  ...rest
}: ISelectDropdownProps): React.FunctionComponentElement<React.ReactNode> {
  const [selectedOption, setSelectedOption] =
    React.useState<ISelectDropdownOption>();
  const [searchValue, setSearchValue] = React.useState<string>();

  // ****** memoized functions
  const renderInput = React.useCallback(
    (params: AutocompleteRenderInputParams): React.ReactNode => {
      return (
        <TextField
          {...params}
          inputProps={{
            ...params.inputProps,
            defaultValue: selectedOption?.label,
            value:
              searchValue ||
              (searchValue === '' ? '' : selectedOption?.label) ||
              undefined,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchValue(e.target.value);
            },
            onBlur: (event) => {
              const { onBlur } = params.inputProps as { onBlur: Function };
              onBlur?.(event);
              setSearchValue(selectedOption?.label || undefined);
            },
          }}
          className='TextField__OutLined__Small'
          variant='outlined'
          placeholder='Select Alignment'
        />
      );
    },
    [selectedOption, searchValue],
  );

  const renderOption = React.useCallback(
    (option: ISelectDropdownOption): React.ReactNode => {
      return (
        <div className='SelectDropdown__option'>
          <Text className='SelectDropdown__option__label' size={14}>
            {option.label}
          </Text>
        </div>
      );
    },
    [],
  );

  const handleOptionChange = React.useCallback(
    (e: React.ChangeEvent<{}>, option: ISelectDropdownOption) => {
      handleSelect(option);
      setSelectedOption(option);
      setSearchValue(undefined);
    },
    [handleSelect, setSelectedOption, setSearchValue],
  );

  // ****** hooks
  React.useEffect(() => {
    if (selected) {
      const controlledSelectedOption = options.find(
        (option) => option.value === selected,
      );
      if (controlledSelectedOption) {
        setSelectedOption(controlledSelectedOption);
      }
    }
  }, [selected, options]);

  // ****** memoized data
  const optionsToRender = React.useMemo(() => {
    if (
      (searchValue || searchValue?.trim() !== '') &&
      searchValue !== selectedOption?.label
    ) {
      const searchKey = searchValue?.toLowerCase() || '';
      return options.filter((item) => {
        return item.label.toLowerCase().indexOf(searchKey) !== -1;
      });
    }
    return options;
  }, [options, searchValue, selectedOption]);

  return (
    <div className='SelectDropdown'>
      <Autocomplete
        {...rest}
        className='SelectDropdown__container'
        fullWidth
        size='small'
        openOnFocus
        disableCloseOnSelect
        disableClearable
        options={optionsToRender}
        value={selectedOption || (options.length ? options[0] : undefined)}
        onChange={handleOptionChange}
        groupBy={(option) => option.group || ''}
        getOptionLabel={(option) => option.label}
        getOptionSelected={(option, value) => option.value === value.value}
        renderInput={renderInput}
        renderOption={renderOption}
        ListboxProps={{ style: { height: 253 } }}
      />
    </div>
  );
}

SelectDropdown.displayName = 'SelectDropdown';

export default React.memo<ISelectDropdownProps>(SelectDropdown);
