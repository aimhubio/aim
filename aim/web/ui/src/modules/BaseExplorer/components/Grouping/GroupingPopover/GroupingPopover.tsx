import React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Divider,
  TextField,
} from '@material-ui/core';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { Badge, Icon, Text, ToggleButton } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { Order } from 'modules/core/pipeline';

import { IGroupingSelectOption } from 'types/services/models/metrics/metricsAppModel';

import { SelectOption } from '../../Controls/CaptionProperties';

import { IGroupingPopoverProps } from './GroupingPopover.d';

import './GroupingPopover.scss';

function GroupingPopover({
  groupName,
  advancedComponent,
  inputLabel,
  ...props
}: IGroupingPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  const { engine } = props;
  const [searchValue, setSearchValue] = React.useState('');
  const availableModifiers = engine.useStore(
    engine.pipeline.additionalDataSelector,
  );
  const currentValues = engine.useStore(engine.groupings.currentValuesSelector);

  const handleSelect = React.useCallback(
    (values: IGroupingSelectOption[], order?: Order[]) => {
      const { fields, orders } = values.reduce(
        (acc: any, item: IGroupingSelectOption, index: number) => {
          acc.fields.push(item.value);
          acc.orders.push(
            order?.[index] ??
              currentValues[groupName].orders[index] ??
              Order.ASC,
          );
          return acc;
        },
        {
          fields: [],
          orders: [],
        },
      );
      engine.groupings.update({
        ...currentValues,
        [groupName]: { fields, orders },
      });

      engine.pipeline.group({
        ...currentValues,
        [groupName]: { fields, orders },
      });
    },
    [engine.groupings, engine.pipeline, currentValues, groupName],
  );

  const onChange = React.useCallback(
    (e: any, values: IGroupingSelectOption[]): void => {
      // skip Backspace if there is an input value to do not delete badge (the last selected field)
      if (e?.code === 'Backspace' && searchValue.length) {
        return;
      }

      handleSelect(values);
    },
    [handleSelect, searchValue.length],
  );

  const onSearchInputChange = React.useCallback(
    (e) => {
      e.stopPropagation();
      setSearchValue(e.target.value);
    },
    [setSearchValue],
  );

  const allOptions: IGroupingSelectOption[] = React.useMemo(() => {
    const modifiers = availableModifiers?.modifiers ?? [];
    return modifiers.map((modifier: string) => {
      return {
        label: modifier,
        value: modifier,
        group: modifier.slice(0, modifier.indexOf('.')),
      };
    });
  }, [availableModifiers?.modifiers]);

  const options = React.useMemo(() => {
    return searchValue
      ? allOptions?.filter(
          (option: SelectOption) => option.label.indexOf(searchValue) !== -1,
        )
      : allOptions;
  }, [allOptions, searchValue]);

  const values: { value: IGroupingSelectOption; order: Order }[] =
    React.useMemo(() => {
      let data: { value: IGroupingSelectOption; order: Order }[] = [];
      allOptions.forEach((option: IGroupingSelectOption) => {
        const index = currentValues[groupName].fields.indexOf(option.value);
        if (index > -1) {
          data.push({
            value: option,
            order: currentValues[groupName].orders[index],
          });
        }
      });

      // Sort selected values by the order of their application
      return currentValues
        ? data.sort(
            (a, b) =>
              currentValues[groupName].fields.indexOf(a.value.value) -
              currentValues[groupName].fields.indexOf(b.value.value),
          )
        : data;
    }, [allOptions, currentValues, groupName]);

  return (
    <ErrorBoundary>
      <div className='BaseGroupingPopover'>
        <div className='BaseGroupingPopover__container'>
          <div className='BaseGroupingPopover__container__select'>
            <Text
              size={12}
              tint={50}
              component='h3'
              className='BaseGroupingPopover__subtitle'
            >
              {inputLabel ?? `Select fields for grouping by ${groupName}`}
            </Text>
            <Autocomplete
              openOnFocus
              size='small'
              multiple
              disableCloseOnSelect
              options={options}
              value={values.map((v) => v.value)}
              onChange={onChange}
              groupBy={(option) => option.group}
              getOptionLabel={(option) => option.label}
              getOptionSelected={(option, value) =>
                option.value === value.value
              }
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps,
                    value: searchValue,
                    onChange: onSearchInputChange,
                  }}
                  className='TextField__OutLined__Small'
                  variant='outlined'
                  placeholder='Select fields'
                />
              )}
              renderTags={(value, getTagProps) => (
                <div className='BaseGroupingPopover__container__select__selectedFieldsContainer'>
                  {value.map((selected, i) => (
                    <Badge
                      key={i}
                      {...getTagProps({ index: i })}
                      label={selected.label}
                      selectBadge={true}
                    />
                  ))}
                </div>
              )}
              renderOption={(option, { selected }) => (
                <div className='BaseGroupingPopover__option'>
                  <Checkbox
                    color='primary'
                    size='small'
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBoxIcon />}
                    style={{ marginRight: 4 }}
                    checked={selected}
                  />
                  <Text
                    className='BaseGroupingPopover__option__label'
                    size={14}
                  >
                    {option.label}
                  </Text>
                </div>
              )}
            />
          </div>
          {values.length > 0 && (
            <>
              <Divider />
              <div className='BaseGroupingPopover__option__chips'>
                {values.map(
                  (
                    field: { value: IGroupingSelectOption; order: Order },
                    index: number,
                  ) => (
                    <div
                      className='BaseGroupingPopover__option__chip'
                      key={field.value.label}
                    >
                      <ToggleButton
                        className='BaseGroupingPopover__option__chip__toggle__button'
                        onChange={(value) => {
                          handleSelect(
                            values.map((v) => v.value),
                            values.map((v, i) =>
                              i === index ? value : v.order,
                            ),
                          );
                        }}
                        leftLabel={'Asc'}
                        rightLabel={'Desc'}
                        leftValue={'asc'}
                        rightValue={'desc'}
                        value={field.order as string}
                        title={field.value.label}
                      />
                    </div>
                  ),
                )}
              </div>
            </>
          )}
          {advancedComponent && (
            <ErrorBoundary>
              <div className='GroupingPopover__advanced__component'>
                <Accordion className='GroupingPopover__accordion__container'>
                  <AccordionSummary
                    expandIcon={
                      <Icon
                        fontSize='0.875rem'
                        name='arrow-bidirectional-close'
                      />
                    }
                    id='panel1c-header'
                  >
                    <Text
                      size={12}
                      tint={50}
                      component='h3'
                      weight={400}
                      className='GroupingPopover__subtitle'
                    >
                      Advanced options
                    </Text>
                  </AccordionSummary>
                  <AccordionDetails style={{ padding: 0 }}>
                    {advancedComponent}
                  </AccordionDetails>
                </Accordion>
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default GroupingPopover;
