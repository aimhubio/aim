import React from 'react';
import _ from 'lodash-es';

import { QueryBadge } from 'stories/QueryBadge.stories';
import {
  QueryFormState,
  QueryRangesState,
} from 'modules/core/engine/explorer/query';
import { getQueryStringFromSelect } from 'modules/core/utils/getQueryStringFromSelect';
import { PipelineStatusEnum } from 'modules/core/engine/types';
import getQueryParamsFromState from 'modules/core/utils/getQueryParamsFromState';
import { getSelectFormOptions } from 'modules/core/utils/getSelectFormOptions';

import Button from 'components/kit_v2/Button';
import IconButton from 'components/kit_v2/IconButton';
import ControlsButton from 'components/kit_v2/ControlsButton';
import Popover from 'components/kit_v2/Popover';
import Box from 'components/kit_v2/Box';
import Tree from 'components/kit_v2/Tree';
import { ITreeProps } from 'components/kit_v2/Tree';

import { ColorPaletteEnum, styled } from 'config/stitches/stitches.config';
import { getSuggestionsByExplorer } from 'config/monacoConfig/monacoConfig';

import { SequenceTypesEnum } from 'types/core/enums';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import removeSyntaxErrBrackets from 'utils/removeSyntaxErrBrackets';
import getAdvancedSuggestion from 'utils/getAdvancedSuggestions';

import ExplorerBar from './ExplorerBar';
import ControlsBar from './ControlsBar';

function LayoutExperimental(props: any) {
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
  const state = engine.useStore(engine.pipeline.stateSelector);
  const status = engine.useStore(engine.pipeline.statusSelector);
  const error = engine.useStore(engine.pipeline.errorSelector);
  const updateError = React.useRef(engine.pipeline.setError);

  const { isExecuting, isInsufficientResources } = React.useMemo((): any => {
    let result: any = {
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
    if (error) {
      let message = error.message || 'Something went wrong';
      let detail = { ...(error.detail || {}) };
      if (message === 'SyntaxError') {
        const syntaxErrDetail = removeSyntaxErrBrackets(
          detail,
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
      return { message, detail };
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
        queryable.queryable_data[sequenceName],
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

  const treeData = React.useMemo(() => {
    return getTreeDataFromQueryableData(queryable.queryable_data[sequenceName]);
  }, [queryable.queryable_data]);

  function filterData(array: any) {
    let modified: any = {};
    for (let key in array) {
      const objKey = Object.keys(array[key])[0];
      const objVal = Object.values(array[key])[0];
      if (modified.hasOwnProperty(objKey)) {
        modified[objKey] = [...modified[objKey], objVal];
      } else {
        modified[objKey] = [objVal];
      }
    }
    return modified;
  }

  function getTreeDataFromQueryableData(
    data: ITreeProps['data'],
    path?: string,
  ): ITreeProps['data'] {
    let modifiedData: ITreeProps['data'] = [];
    for (let key in data) {
      let val = data[key];
      let treeItemKey: string = path ? `${path}.${key}` : key;
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          let filtered: any = filterData(val);
          modifiedData.push({
            title: key,
            key: treeItemKey,
            children: getTreeDataFromQueryableData([filtered], treeItemKey),
          });
        } else {
          for (let key1 in val) {
            let treeItemKey = path ? `${path}.${key1}` : key1;
            if (typeof val[key1] === 'object') {
              modifiedData.push({
                title: key1,
                key: treeItemKey,
                children: getTreeDataFromQueryableData(val[key1], treeItemKey),
              });
            }
          }
        }
      } else {
        let treeItemKey = path ? `${path}.${data[key]}` : key;
        modifiedData.push({
          title: data[key],
          key: treeItemKey,
        });
      }
    }
    return modifiedData;
  }

  const onTreeCheckChange: ITreeProps['onCheck'] = (checked, info) => {
    let childrenKeysFromChecked = info?.checkedNodes
      ?.filter((node: any) => node.children)
      .map((node) => node.children?.map((child) => child.key))
      .flat();
    const data = info.checkedNodes
      .filter((node) => childrenKeysFromChecked.indexOf(node.key) === -1)
      .map((node) => node.key);
    updateQuery.current({
      checkedTreeKeys: data,
    });
  };

  console.log('query', query.checkedTreeKeys);

  return (
    <>
      <ExplorerBar />
      <Box
        as='section'
        css={{
          display: 'flex',
          p: '$5 $7',
          borderBottom: '1px solid $secondary20',
        }}
      >
        <Box css={{ display: 'flex', fd: 'column', gap: '$4', flex: 1 }}>
          <Box css={{ display: 'flex', ai: 'center' }}>
            <Popover
              popperProps={{ align: 'start' }}
              content={
                <Tree
                  onCheck={onTreeCheckChange}
                  checkedKeys={query.checkedTreeKeys}
                  checkable
                  data={treeData}
                />
              }
              trigger={
                <Button size='md' leftIcon='menu'>
                  Filter {sequenceName}
                </Button>
              }
            />
            <Box css={{ display: 'flex', gap: '$3', ml: '$5' }}>
              {query.checkedTreeKeys?.map((key) => (
                <QueryBadge key={key} color='primary' size='md'>
                  {key}
                </QueryBadge>
              ))}
            </Box>
          </Box>
          <Box
            css={{
              display: 'flex',
              ai: 'center',
            }}
          >
            <Button size='md' leftIcon='plus' variant='text'>
              Add run filter
            </Button>
            <Box css={{ display: 'flex', gap: '$3', ml: '$5' }}>
              <QueryBadge size='md'>run.dataset.name {'>'} 0.00001</QueryBadge>
            </Box>
          </Box>
        </Box>
        <Box
          css={{
            display: 'flex',
            fd: 'column',
            gap: '$4',
            pl: '$7',
            borderLeft: '1px solid $secondary20',
          }}
        >
          <Button leftIcon='reset' color={ColorPaletteEnum.success}>
            Update
          </Button>
          <Box css={{ display: 'flex', ai: 'center', jc: 'space-between' }}>
            <IconButton
              icon='edit'
              color={ColorPaletteEnum.secondary}
              variant='text'
            />
            <IconButton
              icon='copy'
              color={ColorPaletteEnum.secondary}
              variant='text'
            />
            <IconButton
              icon='eye-fill-show'
              color={ColorPaletteEnum.secondary}
              variant='text'
            />
          </Box>
        </Box>
      </Box>
      <ControlsBar />
    </>
  );
}

export default LayoutExperimental;
