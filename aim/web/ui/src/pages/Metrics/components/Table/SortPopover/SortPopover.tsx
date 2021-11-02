import React from 'react';

import { Button, Checkbox, TextField } from '@material-ui/core';
import { Autocomplete, AutocompleteChangeDetails } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { ToggleButton, Icon } from 'components/kit';

import { ISortPopoverProps } from 'types/pages/metrics/components/SortPopover/SortPopover';
import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import getValueByField from 'utils/getValueByField';

import './SortPopover.scss';

function SortPopover({
  sortOptions,
  sortFields,
  onSort,
  onReset,
}: ISortPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  let [inputValue, setInputValue] = React.useState('');

  function onChange(
    e: object,
    values: IGroupingSelectOption[],
    d: unknown,
    option?: AutocompleteChangeDetails<IGroupingSelectOption>,
  ) {
    if (option) {
      onSort(option?.option.value, 'none');
    } else {
      // if there is a 1 selected option, the option param is null  [material]
      onSort(sortFields[0][0], 'none');
    }
  }

  function handleDelete(field: string): void {
    onSort(field, 'none');
  }

  const selectOptions: IGroupingSelectOption[] = React.useMemo(() => {
    const filtered: IGroupingSelectOption[] = [...sortOptions].filter(
      (options) => options.group === 'run',
    );
    return inputValue.trim() !== ''
      ? filtered
          .slice()
          .sort(
            (a, b) => a.label.indexOf(inputValue) - b.label.indexOf(inputValue),
          )
      : filtered;
  }, [sortOptions, inputValue]);

  return (
    <div className='SortPopover__container'>
      <div className='SortPopover__select__container'>
        <Autocomplete
          id='select-sort'
          size='small'
          multiple
          disableCloseOnSelect
          options={selectOptions}
          onChange={onChange}
          onInputChange={(e, value, reason) => setInputValue(value)}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, value) => option.value === value.value}
          renderTags={() => null}
          renderInput={(params) => (
            <TextField
              {...params}
              variant='outlined'
              label='Select Options'
              placeholder='Select'
            />
          )}
          ListboxProps={{
            style: {
              height: 250,
            },
          }}
          renderOption={(option, { selected }) => (
            <div className='SortPopover__select__item'>
              <Checkbox
                color='primary'
                icon={<CheckBoxOutlineBlank />}
                checkedIcon={<CheckBoxIcon />}
                style={{ marginRight: 4 }}
                checked={selected}
              />
              <span>{option.label}</span>
            </div>
          )}
        />
      </div>
      <div className='SortPopover__chip__container'>
        {sortFields.map((field) => (
          <div className='SortPopover__chip' key={field[0]}>
            <div className='SortPopover__chip__left'>
              <span
                className='SortPopover__chip__delete'
                onClick={() => handleDelete(field[0])}
              >
                <Icon name='close' />
              </span>
            </div>
            <ToggleButton
              className='TooltipContentPopover__toggle__button'
              onChange={(value) => {
                onSort && onSort(field[0], value);
              }}
              leftLabel={'Asc'}
              rightLabel={'Desc'}
              leftValue={'asc'}
              rightValue={'desc'}
              value={field[1] as string}
              title={getValueByField(selectOptions, field[0])}
            />
          </div>
        ))}
      </div>
      <div className='SortPopover__reset__sorting'>
        <Button onClick={onReset} size='small'>
          Reset Sorting
        </Button>
      </div>
    </div>
  );
}

export default React.memo<ISortPopoverProps>(SortPopover);
