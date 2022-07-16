import React from 'react';

import { TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteRenderInputParams } from '@material-ui/lab';

import { Text } from 'components/kit';

import {
  ISelectDropdownOption as ISelectOption,
  ISelectDropdownProps,
} from './SelectDropdown.d';

import './SelectDropdown.scss';

/**
 * @property {ISelectDropdownOption[]} selectOptions - options for select dropdown
 * @property {Function} handleSelect - handle selected option
 * @property {string | undefined} selected - controlled select dropdown (optional)
 * @property {AutocompleteProps} rest - rest props for Autocomplete component
 * @property {React.HTMLElement} children - children element
 */

function SelectDropdown({
  selectOptions = [],
  handleSelect,
  selected,
  ...rest
}: ISelectDropdownProps<ISelectOption>): React.FunctionComponentElement<React.ReactNode> {
  const [selectedOption, setSelectedOption] = React.useState<ISelectOption>();
  const [searchValue, setSearchValue] = React.useState<string>();

  // ****** memoized functions
  const renderInput = React.useCallback(
    (params: AutocompleteRenderInputParams): React.ReactNode => {
      return (
        <TextField
          {...params}
          inputProps={{
            ...params.inputProps,
            value:
              searchValue ||
              (searchValue === '' ? '' : selectedOption?.label || ''),
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchValue(e.target.value);
            },
            onBlur: (event) => {
              const { onBlur } = params.inputProps as { onBlur: Function };
              onBlur?.(event);
              setSearchValue(selectedOption?.label);
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
    (option: ISelectOption): React.ReactNode => {
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
    (e: React.ChangeEvent<{}>, option: ISelectOption) => {
      handleSelect(option);
      setSelectedOption(option);
      setSearchValue(undefined);
    },
    [handleSelect, setSelectedOption, setSearchValue],
  );

  // ****** hooks
  React.useEffect(() => {
    if (selected) {
      const controlledSelectedOption = selectOptions.find(
        (option: ISelectOption) => option.value === selected,
      );
      if (controlledSelectedOption) {
        setSelectedOption(controlledSelectedOption);
      }
    }
  }, [selected, selectOptions]);

  // ****** memoized data
  const optionsToRender = React.useMemo(() => {
    if (
      (searchValue || searchValue?.trim() !== '') &&
      searchValue !== selectedOption?.label
    ) {
      const searchKey = searchValue?.toLowerCase() || '';
      return selectOptions.filter((item: ISelectOption) => {
        return item.label.toLowerCase().indexOf(searchKey) !== -1;
      });
    }
    return selectOptions;
  }, [selectOptions, searchValue, selectedOption]);

  return (
    <div className='SelectDropdown'>
      <Autocomplete
        fullWidth
        size='small'
        openOnFocus
        disableCloseOnSelect
        disableClearable
        options={optionsToRender}
        value={
          selectedOption ||
          (selectOptions.length ? selectOptions[0] : undefined)
        }
        onChange={handleOptionChange}
        groupBy={(option: ISelectOption) => option.group || ''}
        getOptionLabel={(option: ISelectOption) => option.label}
        getOptionSelected={(option: ISelectOption, value) =>
          option.value === value.value
        }
        renderInput={renderInput}
        renderOption={renderOption}
        classes={{
          popper: 'SelectDropdown__popper',
        }}
        {...rest}
      />
    </div>
  );
}

SelectDropdown.displayName = 'SelectDropdown';

export default React.memo<ISelectDropdownProps<ISelectOption>>(SelectDropdown);
