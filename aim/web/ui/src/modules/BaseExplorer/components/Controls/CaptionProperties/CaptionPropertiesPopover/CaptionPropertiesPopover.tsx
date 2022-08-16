import React from 'react';

import { Checkbox, Divider, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Badge, Text, ToggleButton } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { SelectedField } from '../CaptionProperties.d';

import { ICaptionPropertiesPopoverProps } from '.';

import './CaptionPropertiesPopover.scss';

function CaptionPropertiesPopover(
  props: ICaptionPropertiesPopoverProps,
): React.FunctionComponentElement<React.ReactNode> {
  const {
    captionProperties,
    engine: {
      useStore,
      additionalDataSelector,
      controls: {
        captionProperties: {
          methods: { update: updateCaptionProperties },
        },
      },
    },
  } = props;
  const availableModifiers = useStore(additionalDataSelector);
  const [searchValue, setSearchValue] = React.useState<string>('');

  const handleSelect = React.useCallback(
    (
      values: ICaptionPropertiesPopoverProps['captionProperties']['selectedFields'],
    ): void => {
      updateCaptionProperties({
        ...captionProperties,
        selectedFields: values,
      });
    },
    [captionProperties, updateCaptionProperties],
  );

  const onSelectedFieldsChange = React.useCallback(
    (
      e: any,
      values: ICaptionPropertiesPopoverProps['captionProperties']['selectedFields'],
    ): void => {
      if (e?.code !== 'Backspace') {
        handleSelect(values);
      } else {
        if (searchValue.length === 0) {
          handleSelect(values);
        }
      }
    },
    [handleSelect, searchValue.length],
  );

  const onDisplayBoxCaptionChange = React.useCallback(
    (value): void => {
      updateCaptionProperties({
        ...captionProperties,
        displayBoxCaption: value === 'Show',
      });
    },
    [captionProperties, updateCaptionProperties],
  );

  const options = React.useMemo(() => {
    const modifiers = availableModifiers?.modifiers ?? [];
    const optionsData: ICaptionPropertiesPopoverProps['captionProperties']['selectedFields'] =
      modifiers.map((modifier: string) => {
        return {
          label: modifier,
          value: modifier,
          group: modifier.slice(0, modifier.indexOf('.')),
        };
      });
    return (
      optionsData?.filter(
        (option: SelectedField) => option.label.indexOf(searchValue) !== -1,
      ) ?? []
    );
  }, [availableModifiers?.modifiers, searchValue]);

  return (
    <ErrorBoundary>
      <div className='CaptionPropertiesPopover'>
        <div className='CaptionPropertiesPopover__section'>
          <Text
            component='h4'
            tint={50}
            className='CaptionPropertiesPopover__subtitle'
          >
            Select Fields To Display In The Box Caption
          </Text>
          <Autocomplete
            id='select-params'
            size='small'
            openOnFocus
            multiple
            disableCloseOnSelect
            options={options}
            value={captionProperties.selectedFields}
            onChange={onSelectedFieldsChange}
            groupBy={(option: SelectedField) => option.group}
            getOptionLabel={(option: SelectedField) => option.label}
            getOptionSelected={(option: SelectedField, value: SelectedField) =>
              option.value === value.value
            }
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps,
                  value: searchValue,
                  onChange: (e: any) => {
                    setSearchValue(e.target.value);
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
              <div className='CaptionPropertiesPopover__SelectedTagsContainer'>
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
        <Divider className='CaptionPropertiesPopover__Divider' />
        <div className='CaptionPropertiesPopover__section'>
          <Text
            component='h4'
            tint={50}
            className='CaptionPropertiesPopover__subtitle'
          >
            Toggle The Box Caption Visibility
          </Text>
          <ToggleButton
            title='Select Mode'
            id='display'
            value={captionProperties.displayBoxCaption ? 'Show' : 'Hide'}
            leftLabel='Hide'
            rightLabel='Show'
            leftValue={'Hide'}
            rightValue={'Show'}
            onChange={onDisplayBoxCaptionChange}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

CaptionPropertiesPopover.displayName = 'CaptionPropertiesPopover';

export default React.memo<ICaptionPropertiesPopoverProps>(
  CaptionPropertiesPopover,
);
