import React from 'react';

import { Box, Divider } from '@material-ui/core';

import { Button, Dropdown, Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import AutocompleteInput from 'components/AutocompleteInput';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import scattersAppModel from 'services/models/scatters/scattersAppModel';
import { trackEvent } from 'services/analytics';

import { ISelectFormProps } from 'types/pages/scatters/components/SelectForm/SelectForm';

import exceptionHandler from 'utils/app/exceptionHandler';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  isDisabled = false,
  selectedOptionsData,
  selectFormData,
  onSelectOptionsChange,
  onSelectRunQueryChange,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [open, setOpen] = React.useState({
    x: false,
    y: false,
  });
  const searchRef = React.useRef<any>(null);
  const autocompleteRef: any = React.useRef<React.MutableRefObject<any>>(null);

  React.useEffect(() => {
    return () => {
      searchRef.current?.abort();
    };
  }, []);

  function handleParamsSearch() {
    if (requestIsPending) {
      return;
    }
    let query = autocompleteRef?.current?.getValue();
    onSelectRunQueryChange(query ?? '');
    searchRef.current = scattersAppModel.getScattersData(true, query ?? '');
    searchRef.current.call((detail: any) => {
      exceptionHandler({ detail, model: scattersAppModel });
    });
    trackEvent(ANALYTICS_EVENT_KEYS.scatters.searchClick);
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchRef.current?.abort();
    scattersAppModel.abortRequest();
  }

  const dropDownOptions: { value: string; label: string }[] =
    React.useMemo(() => {
      let data: { value: string; label: string }[] = [];
      if (selectFormData.options) {
        for (let option of selectFormData.options) {
          data.push({ value: option.key, label: option.label });
        }
      }
      return data;
    }, [selectFormData.options]);

  function onChange(
    type: 'x' | 'y',
    option: { value: string; label: string } | null,
  ): void {
    if (option) {
      const selectedOptions = selectedOptionsData?.options;
      if (type === 'y') {
        onSelectOptionsChange([
          selectFormData.options.find((o) => o.key === option.value),
          selectedOptions.length === 2 ? selectedOptions[1] : null,
        ]);
      } else if (type === 'x') {
        onSelectOptionsChange([
          selectedOptions[0] || null,
          selectFormData.options.find((o) => o.key === option.value),
        ]);
      }
    }
  }

  return (
    <ErrorBoundary>
      <div className='Scatters__SelectForm'>
        <Box display='flex'>
          <ErrorBoundary>
            <div className='Scatters__SelectForm__container__options'>
              <Box
                width='100%'
                display='flex'
                justifyContent='space-between'
                alignItems='center'
              >
                <Box display='flex' alignItems='center' flex={1}>
                  <ErrorBoundary>
                    <Dropdown
                      key='x-axis'
                      size='medium'
                      isColored
                      onChange={(option) => onChange('x', option)}
                      value={selectedOptionsData?.options[1]?.key || null}
                      options={dropDownOptions}
                      onMenuOpen={() => setOpen({ y: false, x: true })}
                      onMenuClose={() => setOpen({ y: false, x: false })}
                      open={open.x}
                      withPortal
                      label='X axis'
                      icon={{ name: 'x-axis' }}
                      isDisabled={isDisabled}
                    />
                  </ErrorBoundary>
                  <Divider
                    style={{ margin: '0 1rem' }}
                    orientation='vertical'
                    flexItem
                  />
                  <ErrorBoundary>
                    <Dropdown
                      key='y-axis'
                      size='medium'
                      isColored
                      onChange={(option) => onChange('y', option)}
                      value={selectedOptionsData?.options[0]?.key || null}
                      options={dropDownOptions}
                      onMenuOpen={() => setOpen({ y: true, x: false })}
                      onMenuClose={() => setOpen({ y: false, x: false })}
                      open={open.y}
                      withPortal
                      label='Y axis'
                      icon={{ name: 'y-axis' }}
                      isDisabled={isDisabled}
                    />
                  </ErrorBoundary>
                </Box>
              </Box>
            </div>
          </ErrorBoundary>
          <Divider
            style={{ margin: '0 1rem' }}
            orientation='vertical'
            flexItem
          />
          <div className='Scatters__SelectForm__container__search'>
            <Button
              color='primary'
              key={`${requestIsPending}`}
              variant={requestIsPending ? 'outlined' : 'contained'}
              startIcon={
                <Icon
                  name={requestIsPending ? 'close' : 'search'}
                  fontSize={requestIsPending ? 12 : 14}
                />
              }
              className='Scatters__SelectForm__search__button'
              onClick={
                requestIsPending ? handleRequestAbort : handleParamsSearch
              }
              disabled={
                !selectedOptionsData?.options[0] ||
                !selectedOptionsData?.options[1]
              }
            >
              {requestIsPending ? 'Cancel' : 'Search'}
            </Button>
          </div>
        </Box>
        <ErrorBoundary>
          <div className='Scatters__SelectForm__TextField'>
            <AutocompleteInput
              refObject={autocompleteRef}
              context={selectFormData?.suggestions}
              error={selectFormData?.error}
              value={selectedOptionsData?.query}
              onEnter={handleParamsSearch}
              disabled={isDisabled}
            />
          </div>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SelectForm);
