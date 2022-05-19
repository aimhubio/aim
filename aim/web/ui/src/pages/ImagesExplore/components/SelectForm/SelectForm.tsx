import React from 'react';

import { Box, Checkbox, Divider, InputBase, Popper } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Icon, Badge, Button } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AutocompleteInput from 'components/AutocompleteInput';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';
import { trackEvent } from 'services/analytics';

import { ISelectFormProps } from 'types/pages/imagesExplore/components/SelectForm/SelectForm';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  selectedImagesData,
  searchButtonDisabled,
  selectFormData,
  onImagesExploreSelectChange,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  toggleSelectAdvancedMode,
  onSearchQueryCopy,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchMetricsRef = React.useRef<any>(null);
  const autocompleteRef: any = React.useRef<React.MutableRefObject<any>>(null);
  const advancedAutocompleteRef: any =
    React.useRef<React.MutableRefObject<any>>(null);
  React.useEffect(() => {
    return () => {
      searchMetricsRef.current?.abort();
    };
  }, []);

  function handleSearch(e?: React.ChangeEvent<any>): void {
    e?.preventDefault();
    if (requestIsPending || searchButtonDisabled) {
      return;
    }
    let query = selectedImagesData?.advancedMode
      ? advancedAutocompleteRef.current.getValue()
      : autocompleteRef.current.getValue();
    if (selectedImagesData?.advancedMode) {
      onSelectAdvancedQueryChange(advancedAutocompleteRef.current.getValue());
    } else {
      onSelectRunQueryChange(autocompleteRef.current.getValue());
    }
    searchMetricsRef.current = imagesExploreAppModel.getImagesData(
      true,
      true,
      query,
    );
    searchMetricsRef.current.call();

    trackEvent(ANALYTICS_EVENT_KEYS.images.searchClick);
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchMetricsRef.current?.abort();
    imagesExploreAppModel.abortRequest();
  }

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onImagesExploreSelectChange(
      value.filter((option: ISelectOption) => lookup[option.label] === 0),
    );
  }

  function handleDelete(field: string): void {
    let fieldData = [...selectedImagesData?.options].filter(
      (opt: ISelectOption) => opt.label !== field,
    );
    onImagesExploreSelectChange(fieldData);
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
    onImagesExploreSelectChange([]);
    onSelectRunQueryChange('');
  }

  const open: boolean = !!anchorEl;
  const id = open ? 'select-metric' : undefined;

  return (
    <ErrorBoundary>
      <div className='SelectForm__container'>
        <div className='SelectForm__metrics__container'>
          <Box display='flex'>
            <Box
              width='100%'
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              {selectedImagesData?.advancedMode ? (
                <div className='SelectForm__textarea'>
                  <AutocompleteInput
                    advanced
                    refObject={advancedAutocompleteRef}
                    context={selectFormData?.advancedSuggestions}
                    value={selectedImagesData?.advancedQuery}
                    onEnter={handleSearch}
                  />
                </div>
              ) : (
                <ErrorBoundary>
                  <Box display='flex' alignItems='center'>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={handleClick}
                      aria-describedby={id}
                    >
                      <Icon name='plus' style={{ marginRight: '0.5rem' }} />
                      Images
                    </Button>
                    <Popper
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      placement='bottom-start'
                      className='SelectForm__Popper'
                    >
                      <Autocomplete
                        open
                        onClose={handleClose}
                        multiple
                        className='Autocomplete__container'
                        size='small'
                        disablePortal={true}
                        disableCloseOnSelect
                        options={selectFormData.options}
                        value={selectedImagesData?.options ?? ''}
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
                            className='SelectForm__metric__select'
                          />
                        )}
                        renderOption={(option) => {
                          let selected: boolean =
                            !!selectedImagesData?.options.find(
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
                              <span className='SelectForm__option__label'>
                                {option.label}
                              </span>
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
                    {selectedImagesData?.options.length === 0 && (
                      <span className='SelectForm__tags__empty'>
                        No images are selected
                      </span>
                    )}
                    <Box className='SelectForm__tags ScrollBar__hidden'>
                      {selectedImagesData?.options?.map(
                        (tag: ISelectOption) => {
                          return (
                            <Badge
                              size='large'
                              key={tag.label}
                              label={tag.label}
                              onDelete={handleDelete}
                            />
                          );
                        },
                      )}
                    </Box>
                  </Box>
                  {selectedImagesData?.options.length > 1 && (
                    <ErrorBoundary>
                      <span
                        onClick={() => onImagesExploreSelectChange([])}
                        className='SelectForm__clearAll'
                      >
                        <Icon name='close' />
                      </span>
                    </ErrorBoundary>
                  )}
                </ErrorBoundary>
              )}
            </Box>
          </Box>
          {selectedImagesData?.advancedMode ? null : (
            <ErrorBoundary>
              <div className='SelectForm__TextField'>
                <AutocompleteInput
                  refObject={autocompleteRef}
                  context={selectFormData?.suggestions}
                  value={selectedImagesData?.query}
                  onEnter={handleSearch}
                />
              </div>
            </ErrorBoundary>
          )}
        </div>

        <div className='SelectForm__search__container'>
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
            className='SelectForm__search__button'
            onClick={requestIsPending ? handleRequestAbort : handleSearch}
            disabled={searchButtonDisabled}
          >
            {requestIsPending ? 'Cancel' : 'Search'}
          </Button>
          <div className='SelectForm__search__actions'>
            <Button onClick={handleResetSelectForm} withOnlyIcon={true}>
              <Icon name='reset' />
            </Button>
            <Button
              className={selectedImagesData?.advancedMode ? 'active' : ''}
              withOnlyIcon={true}
              onClick={toggleEditMode}
            >
              <Icon name='edit' />
            </Button>
            <Button onClick={onSearchQueryCopy} withOnlyIcon={true}>
              <Icon name='copy' />
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SelectForm);
