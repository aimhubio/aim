import React from 'react';
import _ from 'lodash-es';

import { IInstructionsState } from 'modules/BaseExplorerCore/store/slices/types';
import { QueryUIStateUnit } from 'modules/BaseExplorerCore/core-store';
import {
  Box,
  Checkbox,
  Divider,
  InputBase,
  Popper,
  Tooltip,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Badge, Button, Icon, Text } from 'components/kit';
import AutocompleteInput from 'components/AutocompleteInput';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { getSuggestionsByExplorer } from 'config/monacoConfig/monacoConfig';

import { AppNameEnum } from 'services/models/explorer';

import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import contextToString from 'utils/contextToString';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';
import { formatValue } from 'utils/formatValue';

import './QueryForm.scss';

function getSelectFormOptions(
  projectsData: Record<unknown | any, unknown | any>,
) {
  let data: ISelectOption[] = [];

  if (projectsData) {
    for (let key in projectsData) {
      data.push({
        label: key,
        group: key,
        value: {
          option_name: key,
          context: null,
        },
      });
      for (let val of projectsData[key]) {
        if (!_.isEmpty(val)) {
          let label = contextToString(val);
          data.push({
            label: `${key} ${label}`,
            group: key,
            value: {
              option_name: key,
              context: val,
            },
          });
        }
      }
    }
  }
  return data.sort(
    alphabeticalSortComparator<ISelectOption>({ orderBy: 'label' }),
  );
}

function getQueryStringFromSelect(queryData: QueryUIStateUnit): string {
  let query = '';
  if (queryData !== undefined) {
    if (queryData.advancedModeOn) {
      query = queryData.advancedInput || '';
    } else {
      query = `${
        queryData.simpleInput ? `${queryData.simpleInput} and ` : ''
      }(${queryData.selections
        .map(
          (option) =>
            `(metric.name == "${option.value?.option_name}"${
              option.value?.context === null
                ? ''
                : ' and ' +
                  Object.keys(option.value?.context)
                    .map(
                      (item) =>
                        `metric.context.${item} == ${formatValue(
                          (option.value?.context as any)[item],
                        )}`,
                    )
                    .join(' and ')
            })`,
        )
        .join(' or ')})`.trim();
    }
  }
  return query;
}

function QueryForm(props: any) {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const engine = props.engine;
  const updateQuery = engine.queryUI.methods.update;
  const queryable: IInstructionsState = engine.useStore(
    engine.instructions.dataSelector,
  );
  const sequenceName: string = engine.useStore(
    (state: any) => state.sequenceName,
  );
  const query: QueryUIStateUnit = engine.useStore(engine.queryUI.stateSelector);
  const isFetching: boolean =
    engine.useStore(engine.pipelineStatusSelector) === 'fetching';
  function onInputChange(val: string): void {
    updateQuery({
      [query.advancedModeOn ? 'advancedInput' : 'simpleInput']: val,
    });
  }

  function onSubmit(): void {
    engine.search({
      q: getQueryStringFromSelect(query),
    });
  }
  const autocompleteContext: Record<any, any> = React.useMemo(() => {
    return getSuggestionsByExplorer(
      sequenceName as AppNameEnum,
      queryable.queryable_data,
    );
  }, [queryable.queryable_data, sequenceName]);

  const onToggleAdvancedMode: () => void = React.useCallback(() => {
    let q = query.advancedInput || getQueryStringFromSelect(query);
    if (q === '()') {
      q = '';
    }
    const advancedMode = !query.advancedModeOn;

    updateQuery({
      advancedModeOn: advancedMode,
      advancedInput: q,
    });
  }, [query, updateQuery]);

  const options = React.useMemo(() => {
    const optionsData: any = getSelectFormOptions(
      queryable.project_sequence_info,
    );
    return (
      optionsData?.filter(
        (option: any) => option.label.indexOf(searchValue) !== -1,
      ) ?? []
    );
  }, [queryable.project_sequence_info, searchValue]);

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

  function handleClick(event: React.ChangeEvent<any>) {
    setAnchorEl(event.currentTarget);
  }

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    updateQuery({
      selections: value.filter((option) => lookup[option.label] === 0),
    });
  }

  function handleResetQueryForm() {
    updateQuery({
      simpleInput: '',
      advancedInput: '',
      selections: [],
    });
  }
  function handleSearchInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setSearchValue(e.target.value);
  }

  function handleDelete(field: string): void {
    let fieldData = [...(query?.selections || [])].filter(
      (opt: ISelectOption) => opt.label !== field,
    );
    updateQuery({ selections: fieldData });
  }

  return (
    <ErrorBoundary>
      <div className='QueryForm'>
        <div className='QueryForm__container'>
          <Box
            width='100%'
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            {query.advancedModeOn ? (
              <div className='QueryForm__textarea'>
                <AutocompleteInput
                  advanced
                  context={autocompleteContext}
                  value={query.advancedInput}
                  onChange={onInputChange}
                  onEnter={onSubmit}
                />
              </div>
            ) : (
              <ErrorBoundary>
                <div className='flex fac'>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleClick}
                  >
                    <Icon name='plus' style={{ marginRight: '0.5rem' }} />
                    Metrics
                  </Button>
                  <Popper
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    placement='bottom-start'
                    className='QueryForm__Popper'
                  >
                    <Autocomplete
                      open
                      onClose={handleClose}
                      multiple
                      size='small'
                      disablePortal
                      disableCloseOnSelect
                      options={options}
                      value={query?.selections}
                      onChange={onSelect}
                      groupBy={(option) => option.group}
                      getOptionLabel={(option) => option.label}
                      renderTags={() => null}
                      disableClearable={true}
                      ListboxProps={{
                        style: {
                          height: 400,
                          width: '100%',
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
                          className='QueryForm__metric__select'
                        />
                      )}
                      renderOption={(option: ISelectOption) => {
                        let selected: boolean = !!query?.selections.find(
                          (item: ISelectOption) => item.label === option.label,
                        )?.label;
                        return (
                          <div className='QueryForm__option'>
                            <Checkbox
                              color='primary'
                              icon={<CheckBoxOutlineBlank />}
                              checkedIcon={<CheckBoxIcon />}
                              checked={selected}
                              size='small'
                            />
                            <Text
                              className='QueryForm__option__label'
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
                  {query.selections.length === 0 && (
                    <Text tint={50} size={14} weight={400}>
                      No metrics are selected
                    </Text>
                  )}
                  <div className='QueryForm__tags ScrollBar__hidden'>
                    {query.selections?.map((tag: ISelectOption) => {
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
                </div>
                {query.selections.length > 1 && (
                  <span
                    onClick={() => updateQuery({ selections: [] })}
                    className='QueryForm__clearAll'
                  >
                    <Icon name='close' />
                  </span>
                )}
              </ErrorBoundary>
            )}
          </Box>
          {query.advancedModeOn ? null : (
            <div className='QueryForm__TextField'>
              <AutocompleteInput
                onChange={onInputChange}
                value={query.simpleInput}
                context={autocompleteContext}
                onEnter={onSubmit}
              />
            </div>
          )}
        </div>
        <div className='QueryForm__search'>
          <Button
            key={`${isFetching}`}
            fullWidth
            color='primary'
            variant={isFetching ? 'outlined' : 'contained'}
            startIcon={
              <Icon
                name={isFetching ? 'close' : 'search'}
                fontSize={isFetching ? 12 : 14}
              />
            }
            className='QueryForm__search__button'
            onClick={onSubmit}
          >
            {isFetching ? 'Cancel' : 'Search'}
          </Button>
          <div className='QueryForm__search__actions'>
            <Tooltip title='Reset query'>
              <div>
                <Button onClick={handleResetQueryForm} withOnlyIcon={true}>
                  <Icon name='reset' />
                </Button>
              </div>
            </Tooltip>
            <Tooltip
              title={
                query.advancedModeOn
                  ? 'Switch to default mode'
                  : 'Enable advanced search mode '
              }
            >
              <div>
                <Button
                  className={query.advancedModeOn ? 'active' : ''}
                  withOnlyIcon={true}
                  onClick={onToggleAdvancedMode}
                >
                  <Icon name='edit' />
                </Button>
              </div>
            </Tooltip>
            <Tooltip title='Copy search query'>
              <div>
                <Button
                  // onClick={onSearchQueryCopy}
                  withOnlyIcon={true}
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

export default QueryForm;
