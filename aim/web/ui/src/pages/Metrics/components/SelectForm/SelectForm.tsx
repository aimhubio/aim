import React from 'react';

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
  selectedMetricsData,
  selectFormData,
  onMetricsSelectChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
  onSearchQueryCopy,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      searchRef.current?.abort();
    };
  }, []);

  function handleMetricSearch(): void {
    if (requestIsPending) {
      return;
    }
    searchRef.current = metricAppModel.getMetricsData(true, true);
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

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onMetricsSelectChange(value.filter((option) => lookup[option.label] === 0));
  }

  function handleDelete(field: string): void {
    let fieldData = [...(selectedMetricsData?.options || [])].filter(
      (opt: ISelectOption) => opt.label !== field,
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
  }

  function handleResetSelectForm(): void {
    onMetricsSelectChange([]);
    onSelectRunQueryChange('');
  }

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
                  context={selectFormData?.advancedSuggestions}
                  value={selectedMetricsData?.advancedQuery}
                  onChange={onSelectAdvancedQueryChange}
                  onEnter={handleMetricSearch}
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
                      options={selectFormData?.options}
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
                          inputProps={params.inputProps}
                          spellCheck={false}
                          placeholder='Search'
                          autoFocus={true}
                          className='Metrics__SelectForm__metric__select'
                        />
                      )}
                      renderOption={(option) => {
                        let selected: boolean =
                          !!selectedMetricsData?.options.find(
                            (item: ISelectOption) =>
                              item.label === option.label,
                          )?.label;
                        return (
                          <div className='SelectForm__option'>
                            <Checkbox
                              color='primary'
                              icon={<CheckBoxOutlineBlank />}
                              checkedIcon={<CheckBoxIcon />}
                              checked={selected}
                              size='small'
                            />
                            <Text
                              className='SelectForm__option__label'
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
                  <div className='Metrics__SelectForm__tags ScrollBar__hidden'>
                    {selectedMetricsData?.options?.map((tag: ISelectOption) => {
                      return (
                        <Badge
                          size='large'
                          key={tag.label}
                          label={tag.label}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </div>
                </Box>
                {selectedMetricsData?.options &&
                  selectedMetricsData.options.length > 1 && (
                    <span
                      onClick={() => onMetricsSelectChange([])}
                      className='Metrics__SelectForm__clearAll'
                    >
                      <Icon name='close' />
                    </span>
                  )}
              </>
            )}
          </Box>
          {selectedMetricsData?.advancedMode ? null : (
            <div className='Metrics__SelectForm__TextField'>
              <AutocompleteInput
                onChange={onSelectRunQueryChange}
                onEnter={handleMetricSearch}
                value={selectedMetricsData?.query}
                context={selectFormData.suggestions}
              />
            </div>
          )}
        </div>
        <div className='Metrics__SelectForm__container__search'>
          <Button
            fullWidth
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
                <Button onClick={handleResetSelectForm} withOnlyIcon={true}>
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
                >
                  <Icon name='edit' />
                </Button>
              </div>
            </Tooltip>
            <Tooltip title='Copy search query'>
              <div>
                <Button onClick={onSearchQueryCopy} withOnlyIcon={true}>
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
