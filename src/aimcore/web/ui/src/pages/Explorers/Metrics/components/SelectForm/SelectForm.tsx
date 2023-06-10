import React from 'react';
import classNames from 'classnames';

import {
  Box,
  Checkbox,
  Divider,
  InputBase,
  Popper,
  Tooltip,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Button, Icon, Badge, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AutocompleteInput from 'components/AutocompleteInput';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import metricAppModel from 'services/models/metrics/metricsAppModel';
import { trackEvent } from 'services/analytics';

import { ISelectFormProps } from 'types/pages/metrics/components/SelectForm/SelectForm';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  isDisabled = false,
  selectedMetricsData,
  selectFormData,
  onMetricsSelectChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
  onSearchQueryCopy,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const searchRef: any = React.useRef<React.MutableRefObject<any>>(null);
  const autocompleteRef: any = React.useRef<React.MutableRefObject<any>>(null);
  const advancedAutocompleteRef: any =
    React.useRef<React.MutableRefObject<any>>(null);
  React.useEffect(() => {
    return () => {
      searchRef.current?.abort();
    };
  }, []);

  function handleMetricSearch(): void {
    if (requestIsPending) {
      return;
    }
    let query = selectedMetricsData?.advancedMode
      ? advancedAutocompleteRef?.current?.getValue()
      : autocompleteRef?.current?.getValue();
    if (selectedMetricsData?.advancedMode) {
      onSelectAdvancedQueryChange(advancedAutocompleteRef.current.getValue());
    } else {
      onSelectRunQueryChange(autocompleteRef.current.getValue());
    }
    searchRef.current = metricAppModel.getMetricsData(true, true, query ?? '');
    searchRef.current.call();
    trackEvent(ANALYTICS_EVENT_KEYS.metrics.searchClick);
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchRef.current?.abort();
    metricAppModel.abortRequest();
  }

  function onSelect(
    event: React.ChangeEvent<{}>,
    value: ISelectOption[],
  ): void {
    if (event.type === 'click') {
      const lookup = value.reduce(
        (acc: { [key: string]: number }, curr: ISelectOption) => {
          acc[curr.key] = ++acc[curr.key] || 0;
          return acc;
        },
        {},
      );
      onMetricsSelectChange(value.filter((option) => lookup[option.key] === 0));
    }
  }

  function handleDelete(field: string): void {
    let fieldData = [...(selectedMetricsData?.options || [])].filter(
      (opt: ISelectOption) => opt.key !== field,
    );
    onMetricsSelectChange(fieldData);
  }

  function toggleEditMode(): void {
    toggleSelectAdvancedMode();
  }

  function handleClick(event: React.ChangeEvent<any>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(event: any, reason: any) {
    if (reason === 'toggleInput') {
      return;
    }
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
    setSearchValue('');
  }

  function handleResetSelectForm(): void {
    onMetricsSelectChange([]);
    onSelectRunQueryChange('');
    onSelectAdvancedQueryChange('');
  }

  function handleSearchInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setSearchValue(e.target.value);
  }

  const options = React.useMemo(() => {
    return (
      selectFormData?.options?.filter(
        (option) => option.label.indexOf(searchValue) !== -1,
      ) ?? []
    );
  }, [searchValue, selectFormData?.options]);

  const open: boolean = !!anchorEl;
  const id = open ? 'select-metric' : undefined;
  return (
    <ErrorBoundary>
      <div className='Metrics__SelectForm'>
        <div className='Metrics__SelectForm__container__metrics'>
          <Box
            width='100%'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            {selectedMetricsData?.advancedMode ? (
              <div className='Metrics__SelectForm__textarea'>
                <AutocompleteInput
                  advanced
                  error={selectFormData.advancedError}
                  refObject={advancedAutocompleteRef}
                  context={selectFormData?.advancedSuggestions}
                  value={selectedMetricsData?.advancedQuery}
                  onEnter={handleMetricSearch}
                  disabled={isDisabled}
                />
              </div>
            ) : (
              <>
                <Box display='flex' alignItems='center'>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleClick}
                    aria-describedby={id}
                    disabled={isDisabled}
                  >
                    <Icon name='plus' style={{ marginRight: '0.5rem' }} />
                    Metrics
                  </Button>
                  <Popper
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    placement='bottom-start'
                    className='Metrics__SelectForm__Popper'
                  >
                    <Autocomplete
                      open
                      onClose={handleClose}
                      multiple
                      className='Autocomplete__container'
                      size='small'
                      disablePortal={true}
                      disableCloseOnSelect
                      options={options}
                      value={selectedMetricsData?.options}
                      onChange={onSelect}
                      groupBy={(option) => option.group}
                      getOptionLabel={(option) => option.label}
                      renderTags={() => null}
                      disableClearable={true}
                      ListboxProps={{
                        style: {
                          height: 400,
                        },
                      }}
                      renderInput={(params) => (
                        <InputBase
                          ref={params.InputProps.ref}
                          inputProps={{
                            ...params.inputProps,
                            value: searchValue,
                            onChange: handleSearchInputChange,
                          }}
                          spellCheck={false}
                          placeholder='Search'
                          autoFocus={true}
                          className='Metrics__SelectForm__metric__select'
                        />
                      )}
                      renderOption={(option) => {
                        let selected: boolean =
                          !!selectedMetricsData?.options.find(
                            (item: ISelectOption) => item.key === option.key,
                          )?.key;
                        return (
                          <div className='Metrics__SelectForm__option'>
                            <Checkbox
                              color='primary'
                              icon={<CheckBoxOutlineBlank />}
                              checkedIcon={<CheckBoxIcon />}
                              checked={selected}
                              size='small'
                            />
                            <Text
                              className='Metrics__SelectForm__option__label'
                              size={14}
                            >
                              {option.label}
                            </Text>
                          </div>
                        );
                      }}
                    />
                  </Popper>
                  <Divider
                    style={{ margin: '0 1rem' }}
                    orientation='vertical'
                    flexItem
                  />
                  {selectedMetricsData?.options.length === 0 && (
                    <Text tint={50} size={14} weight={400}>
                      No metrics are selected
                    </Text>
                  )}
                  <Box
                    className='Metrics__SelectForm__tags ScrollBar__hidden'
                    flex={1}
                  >
                    {selectedMetricsData?.options?.map((tag: ISelectOption) => {
                      return (
                        <Badge
                          size='large'
                          key={tag.label}
                          label={tag.label}
                          value={tag.key}
                          onDelete={handleDelete}
                          disabled={isDisabled}
                        />
                      );
                    })}
                  </Box>
                </Box>
                {selectedMetricsData?.options &&
                  selectedMetricsData.options.length > 1 && (
                    <Button
                      onClick={() => onMetricsSelectChange([])}
                      withOnlyIcon
                      className={classNames('Metrics__SelectForm__clearAll', {
                        disabled: isDisabled,
                      })}
                      size='xSmall'
                      disabled={isDisabled}
                    >
                      <Icon name='close' />
                    </Button>
                  )}
              </>
            )}
          </Box>
          {selectedMetricsData?.advancedMode ? null : (
            <div className='Metrics__SelectForm__TextField'>
              <AutocompleteInput
                refObject={autocompleteRef}
                error={selectFormData.error}
                value={selectedMetricsData?.query}
                context={selectFormData.suggestions}
                onEnter={handleMetricSearch}
                disabled={isDisabled}
              />
            </div>
          )}
        </div>
        <div className='Metrics__SelectForm__container__search'>
          <Button
            fullWidth
            key={`${requestIsPending}`}
            color='primary'
            variant={requestIsPending ? 'outlined' : 'contained'}
            startIcon={
              <Icon
                name={requestIsPending ? 'close' : 'search'}
                fontSize={requestIsPending ? 12 : 14}
              />
            }
            className='Metrics__SelectForm__search__button'
            onClick={requestIsPending ? handleRequestAbort : handleMetricSearch}
          >
            {requestIsPending ? 'Cancel' : 'Search'}
          </Button>
          <div className='Metrics__SelectForm__search__actions'>
            <Tooltip title='Reset query'>
              <div>
                <Button
                  onClick={handleResetSelectForm}
                  withOnlyIcon={true}
                  disabled={isDisabled}
                >
                  <Icon name='reset' />
                </Button>
              </div>
            </Tooltip>
            <Tooltip
              title={
                selectedMetricsData?.advancedMode
                  ? 'Switch to default mode'
                  : 'Enable advanced search mode '
              }
            >
              <div>
                <Button
                  className={selectedMetricsData?.advancedMode ? 'active' : ''}
                  withOnlyIcon={true}
                  onClick={toggleEditMode}
                  disabled={isDisabled}
                >
                  <Icon name='edit' />
                </Button>
              </div>
            </Tooltip>
            <Tooltip title='Copy search query'>
              <div>
                <Button
                  onClick={onSearchQueryCopy}
                  withOnlyIcon={true}
                  disabled={isDisabled}
                >
                  <Icon name='copy' />
                </Button>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SelectForm);
