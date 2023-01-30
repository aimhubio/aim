import React from 'react';
import _ from 'lodash-es';

import { QueryBadge } from 'stories/QueryBadge.stories';

import Button from 'components/kit_v2/Button';
import IconButton from 'components/kit_v2/IconButton';
import Popover from 'components/kit_v2/Popover';
import Box from 'components/kit_v2/Box';
import Tree from 'components/kit_v2/Tree';
import { ITreeProps } from 'components/kit_v2/Tree';
import AutocompleteInput from 'components/AutocompleteInput';

import { getSuggestionsByExplorer } from 'config/monacoConfig/monacoConfig';

import { getSelectFormOptions } from 'modules/core/utils/getSelectFormOptions';
import getQueryParamsFromState from 'modules/core/utils/getQueryParamsFromState';
import { PipelineStatusEnum } from 'modules/core/engine/types';
import { getQueryStringFromSelect } from 'modules/core/utils/getQueryStringFromSelect';
import {
  QueryFormState,
  QueryRangesState,
} from 'modules/core/engine/explorer/query';

import { SequenceTypesEnum } from 'types/core/enums';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import removeSyntaxErrBrackets from 'utils/removeSyntaxErrBrackets';
import getAdvancedSuggestion from 'utils/getAdvancedSuggestions';

import ExplorerBar from './ExplorerBar';
import ControlsBar from './ControlsBar';

type StatusCheckResult = {
  isExecuting: boolean;
  isInsufficientResources: boolean;
};

function LayoutExperimental(props: any) {
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

  function filterTreeData(array: any) {
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
          let filtered: any = filterTreeData(val);
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
    // console.log(info);
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

  // onTreeSelect
  const onTreeSelect: ITreeProps['onSelect'] = (selected, info) => {
    const { key, checked, children } = info.node;
    console.log(selected, info);
    if (!checked) {
      updateQuery.current({
        checkedTreeKeys: [...(query?.checkedTreeKeys || []), key],
      });
    }
    if (checked) {
      updateQuery.current({
        checkedTreeKeys: (query?.checkedTreeKeys || []).filter(
          (item) => item !== key,
        ),
      });
    }
    // let childrenKeysFromChecked = info.node.children
  };

  return (
    <>
      {/* <ExplorerBar /> */}
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
                  data={options.map((item) => ({
                    ...item,
                    title: item.label,
                    key: item.label,
                  }))}
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
            {/* {query.advancedModeOn ? null : ( */}
            <Box css={{ width: '100%' }}>
              <AutocompleteInput
                advanced={query.advancedModeOn}
                disabled={isExecuting}
                onChange={onInputChange}
                value={query.simpleInput}
                context={autocompleteContext.suggestions}
                onEnter={onSubmit}
                error={processedError}
                forceRemoveError={true}
              />
            </Box>
          </Box>
        </Box>
        <Box css={{ m: '0 $7', width: '1px', bc: '$secondary20' }} />
        <Box
          css={{
            display: 'flex',
            fd: 'column',
            gap: '$4',
          }}
        >
          <Button onClick={onSubmit} leftIcon='reset' color='success'>
            Update
          </Button>
          <Box css={{ display: 'flex', ai: 'center', jc: 'space-between' }}>
            <IconButton
              onClick={onToggleAdvancedMode}
              icon='edit'
              color='secondary'
              variant='text'
            />
            <IconButton
              onClick={onQueryCopy}
              icon='copy'
              color='secondary'
              variant='text'
            />
            <IconButton icon='reset' color='secondary' variant='text' />
          </Box>
        </Box>
      </Box>
      {/* <ControlsBar /> */}
    </>
  );
}

export default LayoutExperimental;
