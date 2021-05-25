import './SelectInput.less';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';

import UI from '../../../../../../../ui';
import {
  classNames,
  flattenObject,
  searchNestedObject,
  removeObjectEmptyKeys,
  excludeObjectPaths,
  formatSystemMetricName,
} from '../../../../../../../utils';
import * as storeUtils from '../../../../../../../storeUtils';
import * as classes from '../../../../../../../constants/classes';
import ContentLoader from 'react-content-loader';
import { HubMainScreenModel } from '../../../../models/HubMainScreenModel';

function SelectInput(props) {
  let [state, setState] = useState({
    offsetStep: 25,
    dropdownIsOpen: false,
    progress: null,
    suggestionsPrefix: null,
  });

  let dropdownIsOpenRef = useRef(false);

  let { searchInput } = HubMainScreenModel.getState();
  let { setSearchInputState } = HubMainScreenModel.emitters;

  let dropdownRef = useRef();
  let selectInputRef = useRef();
  let timerRef = useRef();

  useEffect(() => {
    document.addEventListener('keydown', escapePressHandler);
    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener('keydown', escapePressHandler);
    };
  }, []);

  useEffect(() => {
    dropdownIsOpenRef.current = state.dropdownIsOpen;
    if (state.dropdownIsOpen) {
      incProgress();
      props.getProjectParams().then((data) => {
        completeProgress();
      });
    }
  }, [state.dropdownIsOpen]);

  function escapePressHandler(evt) {
    if (evt.key === 'Escape') {
      const isNotCombinedKey = !(evt.ctrlKey || evt.altKey || evt.shiftKey);
      if (isNotCombinedKey) {
        if (dropdownIsOpenRef.current) {
          blurSelectInput();
        }
      }
    }
  }

  function incProgress() {
    clearTimeout(timerRef.current);
    setState((s) =>
      s.progress > 90
        ? s
        : {
          ...s,
          progress:
              s.progress === null
                ? 0
                : s.progress + Math.round(Math.random() * 10),
        },
    );
    timerRef.current = setTimeout(incProgress, 100);
  }

  function completeProgress() {
    clearTimeout(timerRef.current);
    setState((s) => ({
      ...s,
      progress: 100,
    }));
    timerRef.current = setTimeout(() => {
      setState((s) => ({
        ...s,
        progress: null,
      }));
    }, 200);
  }

  function handleInputChange(value) {
    setSearchInputState(
      {
        selectInput: value,
      },
      () => setTimeout(() => updateSuggestionsPrefix(value), 50),
    );
  }

  function handleInputFocus(evt) {
    setState((s) => ({
      ...s,
      dropdownIsOpen: true,
    }));
    props.setFocused(true);
  }

  function handleInputBlur(evt) {
    if (evt.relatedTarget !== dropdownRef?.current) {
      setState((s) => ({
        ...s,
        dropdownIsOpen: false,
      }));
      props.setFocused(false);
    }
  }

  function blurSelectInput() {
    selectInputRef.current?.inputRef?.current?.blur();
  }

  function getSelectedAttrs() {
    const selectVal = searchInput.selectInput.trim();
    if (!selectVal.length) {
      return [];
    }

    const selectAttrs = selectVal.split(',').map((i) => i.trim());
    return selectAttrs;
  }

  function selectAttribute(
    attrName,
    replace = false,
    cb = null,
    addTrailingComma = false,
  ) {
    replace = replace && !searchInput.selectInput.trim().endsWith(',');

    let selectedAttrs = getSelectedAttrs();
    let addFlag = false;

    if (selectedAttrs.indexOf(attrName) !== -1) {
      selectedAttrs = selectedAttrs.filter((i) => i !== attrName);
    } else {
      if (replace) {
        selectedAttrs.pop();
      }
      selectedAttrs.push(attrName);
      addFlag = true;
    }
    selectedAttrs = _.uniq(selectedAttrs.filter((i) => !!i));

    const value = selectedAttrs.join(', ');
    setSearchInputState(
      {
        selectInput: addFlag && addTrailingComma ? `${value}, ` : value,
      },
      () => {
        resetSuggestionsPrefix();
      },
    );

    if (selectInputRef?.current) {
      selectInputRef.current.inputRef?.current?.focus();
    }

    if (cb !== null) {
      cb();
    }
  }

  function updateSuggestionsPrefix(value) {
    if (!!value) {
      const lastItem = value?.split(',').pop()?.trim();
      if (lastItem === state.suggestionsPrefix) {
        return;
      }
      setState((s) => ({
        ...s,
        suggestionsPrefix: !!lastItem ? lastItem : null,
      }));
    } else {
      resetSuggestionsPrefix();
    }
  }

  function resetSuggestionsPrefix() {
    setState((s) => ({
      ...s,
      suggestionsPrefix: null,
    }));
  }

  function _renderMetrics(
    metrics,
    system = false,
    replaceOnClick = false,
    itemOnClickCB = null,
    addTrailingComma = false,
  ) {
    if (!metrics || !metrics.length) {
      return null;
    }

    const selectedAttrs = getSelectedAttrs();

    return (
      <div className='SelectInput__dropdown__group'>
        <div className='SelectInput__dropdown__group__item__row group'>
          <div
            className='SelectInput__dropdown__group__item__placeholder'
            style={{
              flexBasis: `${state.offsetStep}px`,
            }}
          />
          <div className='SelectInput__dropdown__group__title'>
            <div className='SelectInput__dropdown__group__title__placeholder' />
            <div className='SelectInput__dropdown__group__title__label'>
              {system ? 'system' : 'metrics'}
            </div>
          </div>
        </div>
        <div className='SelectInput__dropdown__group__body'>
          {!!metrics &&
            metrics.sort().map((metric) => (
              <div
                className={classNames({
                  SelectInput__dropdown__group__item: true,
                  selected: selectedAttrs.indexOf(metric) !== -1,
                })}
                key={`${metric}`}
                onClick={(evt) =>
                  selectAttribute(
                    metric,
                    replaceOnClick,
                    itemOnClickCB,
                    addTrailingComma,
                  )
                }
              >
                <div
                  className={classNames({
                    SelectInput__dropdown__group__item__icon__wrapper: true,
                    metric: true,
                    system: system,
                  })}
                >
                  {selectedAttrs.indexOf(metric) !== -1 ? (
                    <UI.Icon i='done' />
                  ) : (
                    <div className='SelectInput__dropdown__group__item__icon__letter'>
                      {system ? 'S' : 'M'}
                    </div>
                  )}
                </div>
                <div
                  className={classNames({
                    SelectInput__dropdown__group__item__row: true,
                    name: true,
                    selected: selectedAttrs.indexOf(metric) !== -1,
                  })}
                >
                  <div
                    className='SelectInput__dropdown__group__item__placeholder'
                    style={{
                      flexBasis: `${state.offsetStep}px`,
                    }}
                  />
                  <div className='SelectInput__dropdown__group__item__name'>
                    <span className='SelectInput__dropdown__group__item__name__short'>
                      {metric}
                    </span>
                    {system && (
                      <span className='SelectInput__dropdown__group__item__name__full'>
                        {formatSystemMetricName(metric)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  function _renderParamItem(
    paramKey,
    parentPath,
    selectedAttrs,
    replaceOnClick,
    itemOnClickCB,
    addTrailingComma,
  ) {
    const param = `${parentPath.join('.')}.${paramKey}`;

    return (
      <div
        className={classNames({
          SelectInput__dropdown__group__item: true,
          selected: selectedAttrs.indexOf(param) !== -1,
        })}
        key={param}
        onClick={(evt) =>
          selectAttribute(
            param,
            replaceOnClick,
            itemOnClickCB,
            addTrailingComma,
          )
        }
      >
        <div className='SelectInput__dropdown__group__item__icon__wrapper param'>
          {selectedAttrs.indexOf(param) !== -1 ? (
            <UI.Icon i='done' />
          ) : (
            <div className='SelectInput__dropdown__group__item__icon__letter'>
              P
            </div>
          )}
        </div>
        <div className='SelectInput__dropdown__group__item__row name'>
          {[...Array(parentPath.length)].map((_, i) => (
            <div
              className='SelectInput__dropdown__group__item__placeholder'
              key={i}
              style={{
                flexBasis: `${state.offsetStep}px`,
              }}
            />
          ))}
          <div className='SelectInput__dropdown__group__item__name'>
            <span className='SelectInput__dropdown__group__item__name__short'>
              {paramKey}
            </span>
            <span className='SelectInput__dropdown__group__item__name__full'>
              {param}
            </span>
          </div>
        </div>
      </div>
    );
  }

  function _renderParams(
    params,
    parentPath = [],
    replaceOnClick = false,
    itemOnClickCB = null,
    addTrailingComma = false,
  ) {
    const selectedAttrs = getSelectedAttrs();

    return (
      !!params &&
      Object.keys(params).map((paramKey) => (
        <Fragment key={paramKey}>
          {typeof params[paramKey] === 'boolean' &&
            _renderParamItem(
              paramKey,
              parentPath,
              selectedAttrs,
              replaceOnClick,
              itemOnClickCB,
              addTrailingComma,
            )}

          {typeof params[paramKey] === 'object' && (
            <div
              className='SelectInput__dropdown__group'
              key={`${parentPath.join('.')}.${paramKey}`}
            >
              <div className='SelectInput__dropdown__group__item__row group'>
                {[...Array(parentPath.length + 1)].map((_, i) => (
                  <div
                    className='SelectInput__dropdown__group__item__placeholder'
                    key={i}
                    style={{
                      flexBasis: `${state.offsetStep}px`,
                    }}
                  />
                ))}
                <div className='SelectInput__dropdown__group__title'>
                  <div className='SelectInput__dropdown__group__title__placeholder' />
                  <div className='SelectInput__dropdown__group__title__label'>
                    {paramKey}
                  </div>
                </div>
              </div>
              <div className='SelectInput__dropdown__group__body'>
                {_renderParams(
                  params[paramKey],
                  [...parentPath, paramKey],
                  replaceOnClick,
                  itemOnClickCB,
                  addTrailingComma,
                )}
              </div>
            </div>
          )}
        </Fragment>
      ))
    );
  }

  function _renderSuggestions() {
    if (!state.suggestionsPrefix?.trim()) {
      return null;
    }

    const suggestionsPrefix = state.suggestionsPrefix.trim();
    const selectedFields = getSelectedAttrs();

    const metrics = [];
    props.project?.metrics?.map(
      (m) =>
        m.indexOf(suggestionsPrefix) !== -1 &&
        selectedFields.indexOf(m) === -1 &&
        metrics.push(m),
    );

    const params = _.cloneDeep(props.project?.params) ?? {};
    excludeObjectPaths(
      params,
      selectedFields.map((i) => i.split('.')),
    );
    searchNestedObject(params, suggestionsPrefix.split('.'));
    removeObjectEmptyKeys(params);

    if (metrics?.length === 0 && Object.keys(params).length === 0) {
      return null;
    }

    return (
      <div className='SelectInput__dropdown__suggestions'>
        <UI.Text
          className='SelectInput__dropdown__title'
          type='primary'
          overline
          bold
        >
          Suggestions
        </UI.Text>
        {!!metrics?.length && (
          <>
            {_renderMetrics(
              metrics.filter((m) => !m.startsWith('__system__')),
              false,
              true,
              resetSuggestionsPrefix,
              true,
            )}
            {_renderMetrics(
              metrics.filter((m) => m.startsWith('__system__')),
              true,
              true,
              resetSuggestionsPrefix,
              true,
            )}
          </>
        )}
        {!!metrics?.length && !!params && Object.keys(params).length > 0 && (
          <div className='SelectInput__dropdown__divider' />
        )}
        {!!params &&
          _renderParams(params, [], true, resetSuggestionsPrefix, true)}
      </div>
    );
  }

  function _renderSelectedFields() {
    const availableFields = [
      ...(props.project?.metrics ?? []),
      ...(props.project?.params
        ? Object.keys(flattenObject(props.project?.params))
        : []),
    ];

    const selectedFields = getSelectedAttrs()?.filter(
      (v, i, self) =>
        !!v.length &&
        self.indexOf(v) === i &&
        availableFields.indexOf(v) !== -1,
    );

    if (!selectedFields || !selectedFields.length) {
      return null;
    }

    return (
      <div className='SelectInput__dropdown__selected'>
        <UI.Text
          className='SelectInput__dropdown__title'
          type='primary'
          overline
          bold
        >
          Selected fields
        </UI.Text>
        <div className='SelectInput__dropdown__selected__items'>
          {selectedFields.map((f, i) => (
            <UI.Label
              className='SelectInput__dropdown__selected__item'
              key={i}
              iconRight={<UI.Icon i='close' />}
              iconOnClick={() => selectAttribute(f)}
              iconIsClickable
              outline
            >
              {f}
            </UI.Label>
          ))}
        </div>
      </div>
    );
  }

  function _renderContentLoader() {
    const cellHeight = 15,
      cellWidth = 25,
      marginX = 10,
      marginY = 10;
    const colsTemplates = [
      [1, 7, 1],
      [1, 12, 1],
      [1, 16, 1],
      [1, 20, 1],
    ];

    return (
      <ContentLoader
        width={600}
        height={300}
        backgroundColor='#F3F3F3'
        foregroundColor='#ECEBEB'
      >
        {[
          [-1, 0],
          [-1, 3],
          [-1, 1],
          [-1, 2],
          [-1, 2],
          [-1, 0],
          [-1, 1],
          [-1, 3],
          [-1, 0],
          [-1, 0],
        ].map((rowMeta, rowIdx) => (
          <>
            {colsTemplates[rowMeta[1]]
              .slice(0, rowMeta[0])
              .map((colSize, colIdx) => (
                <rect
                  key={`${rowIdx}-${colIdx}`}
                  x={
                    colIdx
                      ? colsTemplates[rowMeta[1]]
                        .slice(0, colIdx)
                        .reduce((a, b) => a + b) *
                          cellWidth +
                        (colIdx + 1) * marginX
                      : marginX
                  }
                  y={rowIdx * (cellHeight + marginY) + marginY}
                  rx={5}
                  ry={5}
                  width={colSize * cellWidth}
                  height={cellHeight}
                />
              ))}
          </>
        ))}
      </ContentLoader>
    );
  }

  return (
    <div className='SelectInput'>
      <UI.Input
        className={classNames({
          SelectForm__form__row__input: true,
          SelectInput__input: true,
          active: state.dropdownIsOpen,
        })}
        classNameWrapper='SelectForm__form__row__input__wrapper'
        placeholder='What to select.. e.g. `loss, acc, hparams.lr'
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyPress={(evt) => {
          if (evt.charCode === 13) {
            props.search();
            blurSelectInput();
          }
        }}
        onChange={(evt) => handleInputChange(evt.target?.value)}
        value={searchInput.selectInput}
        ref={selectInputRef}
        tabIndex={1}
      />
      {state.dropdownIsOpen && (
        <div
          className={classNames({
            SelectInput__dropdown: true,
            open: true,
          })}
          tabIndex={0}
          ref={dropdownRef}
        >
          <div
            className='SelectInput__dropdown__body'
            onClick={() => selectInputRef.current.inputRef?.current?.focus()}
          >
            {state.progress !== null && (
              <div
                className='SelectInput__dropdown__body__loader'
                style={{
                  width: `${state.progress}%`,
                }}
              />
            )}
            {props.project.params === null || props.project.metrics === null ? (
              _renderContentLoader()
            ) : (
              <>
                {_renderSuggestions()}
                {_renderSelectedFields()}
                <UI.Text
                  className='SelectInput__dropdown__title'
                  type='primary'
                  overline
                  bold
                >
                  Available fields
                </UI.Text>
                {!!props.project?.metrics?.length &&
                  _renderMetrics(
                    props.project.metrics.filter(
                      (m) => !m.startsWith('__system__'),
                    ),
                  )}
                {!!props.project?.metrics?.length &&
                  _renderMetrics(
                    props.project.metrics.filter((m) =>
                      m.startsWith('__system__'),
                    ),
                    true,
                  )}
                {!!props.project?.metrics?.length &&
                  !!props.project?.params &&
                  Object.keys(props.project?.params).length > 0 && (
                  <div className='SelectInput__dropdown__divider' />
                )}
                {!!props.project?.params && _renderParams(props.project.params)}
                {props.project?.metrics?.length === 0 &&
                  Object.keys(props.project?.params).length === 0 && (
                    <UI.Text type='grey' spacing spacingTop center>
                      Empty
                    </UI.Text>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

SelectInput.propTypes = {};

export default storeUtils.getWithState(
  classes.EXPLORE_PARAMS_SELECT_INPUT,
  SelectInput,
);
