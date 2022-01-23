import React from 'react';
import classNames from 'classnames';
import _ from 'lodash-es';

import { Checkbox, TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteChangeDetails } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Button, Text } from 'components/kit';

import { ISortPopoverProps } from 'types/pages/metrics/components/SortPopover/SortPopover';

import { SortActionTypes, SortField, SortFields } from 'utils/getSortedFields';

import SortPopoverList from './SortPopoverList';

import './SortPopover.scss';

function SortPopover({
  sortOptions,
  sortFields,
  onSort,
  onReset,
  readOnlyFieldsLabel,
}: ISortPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  let [inputValue, setInputValue] = React.useState('');
  function onChange(
    e: object,
    values: SortFields,
    d: unknown,
    option?: AutocompleteChangeDetails<SortField>,
  ) {
    if (option) {
      //@ts-ignore
      onSort({ sortFields: values, actionType: SortActionTypes.CHANGE });
    } else {
      // if there is a 1 selected option, the option param is null  [material]
      onSort({ sortFields, actionType: SortActionTypes.CHANGE });
    }
  }

  const selectOptions: SortFields = React.useMemo(() => {
    const mappedSortOptions: SortFields = [...sortOptions].map((option) => ({
      ...option,
      readonly: false,
      order: 'asc',
    }));
    return inputValue.trim() !== ''
      ? mappedSortOptions
          .slice()
          .sort(
            (a, b) => a.label.indexOf(inputValue) - b.label.indexOf(inputValue),
          )
      : mappedSortOptions;
  }, [sortOptions, inputValue]);

  const { filteredSortFields, readOnlyFields, readOnlyFieldsKeys } =
    React.useMemo(() => {
      const readOnlyFields = sortFields.filter(
        (field: SortField) => field.readonly,
      );
      return {
        filteredSortFields: sortFields.filter(
          (field: SortField) => !field.readonly,
        ),
        readOnlyFields,
        readOnlyFieldsKeys: readOnlyFields.map(
          (field: SortField) => field.value,
        ),
      };
    }, [sortFields]);

  return (
    <div className='SortPopover__container'>
      <Text size={12} tint={50} className={'SortPopover__container__label'}>
        SELECT FIELDS
      </Text>
      <div className='SortPopover__container__selectBox'>
        <Autocomplete
          id='select-sort'
          size='small'
          multiple
          disableCloseOnSelect
          options={selectOptions}
          value={sortFields}
          disableClearable
          onChange={onChange}
          onInputChange={(e, value, reason) => setInputValue(value)}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, value) => {
            return option.value === value.value;
          }}
          renderTags={() => null}
          renderInput={(params) => (
            <TextField
              {...params}
              variant='outlined'
              className={
                'TextField__OutLined__Small SortPopover__container__selectBox__selectInput'
              }
              placeholder={
                sortFields.length > 0
                  ? `${sortFields.length} Selected Items`
                  : 'Select...'
              }
            />
          )}
          ListboxProps={{
            style: {
              height: 250,
            },
            className:
              'MuiAutocomplete-listbox SortPopover__container__selectBox__listBox',
          }}
          renderOption={(option, { selected }) => (
            <div
              className={classNames('SortPopover__select__item', {
                isDisabled: readOnlyFieldsKeys.includes(option.value),
              })}
            >
              <Checkbox
                color='primary'
                icon={<CheckBoxOutlineBlank />}
                checkedIcon={<CheckBoxIcon />}
                style={{ marginRight: 4 }}
                checked={selected}
                disabled={readOnlyFieldsKeys.includes(option.value)}
              />
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>
      <div className='SortPopover__container__optionList'>
        {!_.isEmpty(readOnlyFields) && (
          <SortPopoverList
            title={readOnlyFieldsLabel}
            onSort={onSort}
            filteredSortFields={readOnlyFields}
            sortFields={sortFields}
          />
        )}
        {!_.isEmpty(filteredSortFields) && (
          <SortPopoverList
            title={'SORTED BY'}
            onSort={onSort}
            sortFields={sortFields}
            filteredSortFields={filteredSortFields}
          />
        )}
      </div>

      <div
        className={classNames('SortPopover__reset__sorting', {
          isEmpty: _.isEmpty(sortFields),
        })}
      >
        <Button size='medium' color='inherit' onClick={onReset}>
          Reset Sorting
        </Button>
      </div>
    </div>
  );
}

export default React.memo<ISortPopoverProps>(SortPopover);
