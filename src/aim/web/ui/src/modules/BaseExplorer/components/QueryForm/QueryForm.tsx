import React from 'react';
import _ from 'lodash-es';

import {
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

import { IQueryFormProps } from 'modules/BaseExplorer/types';
import { getQueryStringFromSelect } from 'modules/core/utils/getQueryStringFromSelect';
import { getSelectFormOptions } from 'modules/core/utils/getSelectFormOptions';
import { PipelineStatusEnum } from 'modules/core/engine/types';
import {
  QueryFormState,
  QueryRangesState,
} from 'modules/core/engine/explorer/query';
import getQueryParamsFromState from 'modules/core/utils/getQueryParamsFromState';

import { ISelectOption } from 'types/services/models/explorer/createAppModel';
import { SequenceTypesEnum } from 'types/core/enums';

import getAdvancedSuggestion from 'utils/getAdvancedSuggestions';
import removeSyntaxErrBrackets from 'utils/removeSyntaxErrBrackets';

import SearchButton from './SearchButton';

import './QueryForm.scss';

type StatusCheckResult = {
  isExecuting: boolean;
  isInsufficientResources: boolean;
};

function QueryForm(props: IQueryFormProps) {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const engine = props.engine;

  const updateQuery = React.useRef(engine.query.form.update);
  const queryable = engine.useStore(engine.instructions.stateSelector);
  const sequenceName: SequenceTypesEnum = engine.pipeline.getSequenceName();

  const query: QueryFormState = engine.useStore(
    engine.query.form.stateSelector,
  );
  const ranges: QueryRangesState = engine.useStore(
    engine.query.ranges.stateSelector,
  );
  const status = engine.useStore(engine.pipeline.statusSelector);
  const error = engine.useStore(engine.pipeline.errorSelector);
  const updateError = React.useRef(engine.pipeline.setError);

  const { isExecuting, isInsufficientResources } =
    React.useMemo((): StatusCheckResult => {
      let result: StatusCheckResult = {
        isExecuting: false,
        isInsufficientResources: false,
      };
      if (status === PipelineStatusEnum.Executing) {
        result.isExecuting = true;
      }
      if (status === PipelineStatusEnum.Insufficient_Resources) {
        result.isInsufficientResources = true;
      }

      return result;
    }, [status]);

  const processedError = React.useMemo(() => {
    if (error?.message === 'SyntaxError') {
      const syntaxErrDetail = removeSyntaxErrBrackets(
        { ...(error.detail || {}) },
        query.advancedModeOn,
      );
      return {
        message: `Query syntax error at line (${syntaxErrDetail.line}, ${
          syntaxErrDetail.offset
        }${
          syntaxErrDetail.end_offset &&
          syntaxErrDetail.end_offset !== syntaxErrDetail.offset
            ? `-${syntaxErrDetail.end_offset}`
            : ''
        })`,
        detail: syntaxErrDetail,
      };
    }
    return;
  }, [error, query.advancedModeOn]);

  const onInputChange = React.useCallback(
    (val: string) => {
      updateQuery.current({
        [query.advancedModeOn ? 'advancedInput' : 'simpleInput']: val,
      });
    },
    [query.advancedModeOn],
  );

  const onSubmit = React.useCallback(() => {
    if (isExecuting) {
      //TODO: abort request
      return;
    } else {
      engine.pipeline.search({
        ...getQueryParamsFromState(
          {
            form: query,
            ranges,
          },
          sequenceName,
        ),
        report_progress: true,
      });
    }
  }, [engine, isExecuting, query, sequenceName, ranges]);

  const autocompleteContext: {
    suggestions: Record<string | number | symbol, unknown>;
    advancedSuggestions: Record<string | number | symbol, unknown>;
  } = React.useMemo(() => {
    let suggestions = getSuggestionsByExplorer(
      sequenceName as any,
      queryable.queryable_data,
    );
    let advancedSuggestions = {};
    if (props.hasAdvancedMode) {
      let contextData = getAdvancedSuggestion(
        queryable.queryable_data?.[sequenceName] || {},
      );
      advancedSuggestions = {
        ...suggestions,
        [sequenceName]: {
          name: '',
          context: _.isEmpty(contextData)
            ? ''
            : {
                ...contextData,
              },
        },
      };
    }
    return { suggestions, advancedSuggestions };
  }, [props.hasAdvancedMode, queryable, sequenceName]);

  const onToggleAdvancedMode: () => void = React.useCallback(() => {
    let q =
      query.advancedInput || getQueryStringFromSelect(query, sequenceName);
    if (q === '()') {
      q = '';
    }
    updateError.current(null);
    updateQuery.current({
      advancedModeOn: !query.advancedModeOn,
      advancedInput: q,
    });
  }, [query, sequenceName]);

  const options = React.useMemo(() => {
    const optionsData: ISelectOption[] = getSelectFormOptions(
      queryable.project_sequence_info,
    );
    return (
      optionsData?.filter(
        (option: ISelectOption) => option.label.indexOf(searchValue) !== -1,
      ) ?? []
    );
  }, [queryable.project_sequence_info, searchValue]);

  const handleAutocompleteClose: (
    event: React.ChangeEvent<{}>,
    reason: string,
  ) => void = React.useCallback(
    (event: React.ChangeEvent<{}>, reason: string) => {
      if (reason === 'toggleInput') {
        return;
      }
      if (anchorEl) {
        anchorEl.focus();
      }
      setAnchorEl(null);
      setSearchValue('');
    },
    [anchorEl],
  );

  const handleAutocompleteOpen: (event: React.ChangeEvent<{}>) => void =
    React.useCallback((event: React.ChangeEvent<{}>) => {
      setAnchorEl(event.currentTarget);
    }, []);

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    updateQuery.current({
      selections: value.filter((option) => lookup[option.label] === 0),
    });
  }

  const handleResetQueryForm: () => void = React.useCallback(() => {
    updateQuery.current({
      simpleInput: null,
      advancedInput: null,
      selections: [],
    });
  }, []);

  const handleSearchInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const onSelectOptionDelete: (option: string) => void = React.useCallback(
    (option: string) => {
      let fieldData = [...(query?.selections || [])].filter(
        (opt: ISelectOption) => opt.label !== option,
      );
      updateQuery.current({ selections: fieldData });
    },
    [query?.selections, updateQuery],
  );

  const onQueryCopy: () => void = React.useCallback(() => {
    navigator.clipboard.writeText(
      getQueryStringFromSelect(query, sequenceName),
    );
  }, [query, sequenceName]);

  return (
    <ErrorBoundary>
      <div className='QueryForm'>
        <div className='QueryForm__container'>
          <div className='fac fjb'>
            {query.advancedModeOn ? (
              <ErrorBoundary>
                <div className='QueryForm__textarea'>
                  <AutocompleteInput
                    advanced
                    context={autocompleteContext.advancedSuggestions}
                    value={query.advancedInput}
                    onChange={onInputChange}
                    onEnter={onSubmit}
                    error={processedError}
                    forceRemoveError={true}
                  />
                </div>
              </ErrorBoundary>
            ) : (
              <ErrorBoundary>
                <div className='flex fac QueryForm__topPanel'>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleAutocompleteOpen}
                    disabled={isExecuting}
                  >
                    <Icon
                      name='plus'
                      className='QueryForm__topPanel__plusIcon'
                    />
                    {sequenceName}
                  </Button>
                  <Popper
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    placement='bottom-start'
                    className='QueryForm__Popper'
                  >
                    <Autocomplete
                      open
                      multiple
                      onClose={handleAutocompleteClose}
                      size='small'
                      disablePortal
                      disableCloseOnSelect
                      options={options}
                      disabled={isExecuting}
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
                      No {sequenceName} are selected
                    </Text>
                  )}
                  <div className='QueryForm__tags ScrollBar__hidden'>
                    {query.selections?.map((tag: ISelectOption) => (
                      <Badge
                        size='large'
                        key={tag.label}
                        label={tag.label}
                        disabled={isExecuting}
                        onDelete={onSelectOptionDelete}
                      />
                    ))}
                  </div>
                  {query.selections.length > 1 && (
                    <span
                      onClick={() => updateQuery.current({ selections: [] })}
                      className='QueryForm__clearAll'
                    >
                      <Icon name='close' />
                    </span>
                  )}
                </div>
                {props.hasAdvancedMode ? null : (
                  <SearchButton
                    isFetching={isExecuting}
                    onSubmit={onSubmit}
                    disabled={isExecuting}
                  />
                )}
              </ErrorBoundary>
            )}
          </div>

          {query.advancedModeOn ? null : (
            <div className='QueryForm__TextField'>
              <AutocompleteInput
                disabled={isExecuting}
                onChange={onInputChange}
                value={query.simpleInput}
                context={autocompleteContext.suggestions}
                onEnter={onSubmit}
                error={processedError}
                forceRemoveError={true}
              />
            </div>
          )}
        </div>
        {props.hasAdvancedMode ? (
          <div className='QueryForm__search'>
            <SearchButton
              isFetching={isExecuting}
              onSubmit={onSubmit}
              disabled={!ranges?.isValid || isInsufficientResources}
            />
            <div className='QueryForm__search__actions'>
              <Tooltip title='Reset query'>
                <div>
                  <Button
                    onClick={handleResetQueryForm}
                    withOnlyIcon={true}
                    disabled={isExecuting}
                  >
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
                    disabled={isExecuting}
                    onClick={onToggleAdvancedMode}
                  >
                    <Icon name='edit' />
                  </Button>
                </div>
              </Tooltip>
              <Tooltip title='Copy search query'>
                <div>
                  <Button onClick={onQueryCopy} withOnlyIcon={true}>
                    <Icon name='copy' />
                  </Button>
                </div>
              </Tooltip>
            </div>
          </div>
        ) : null}
      </div>
    </ErrorBoundary>
  );
}

export const AdvancedQueryForm = React.memo((props: IQueryFormProps) => (
  <QueryForm engine={props.engine} hasAdvancedMode />
));

export default React.memo<IQueryFormProps>(QueryForm);
