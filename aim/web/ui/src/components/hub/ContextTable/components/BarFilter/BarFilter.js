import './BarFilter.less';

import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  classNames,
  flattenObject,
  removeObjectEmptyKeys,
  searchNestedObject,
  transformNestedArrToObj,
} from '../../../../../utils';
import UI from '../../../../../ui';
import * as _ from 'lodash';

function BarFilter({ excludedFields, setExcludedFields, maxHeight, fields }) {
  let [opened, setOpened] = useState(false);
  let [searchInput, setSearchInput] = useState('');

  let popupRef = useRef();
  let searchRef = useRef();

  useEffect(() => {
    if (opened) {
      popupRef.current?.focus();
      searchRef.current?.inputRef?.current?.focus();
    } else {
      setSearchInput('');
    }
  }, [opened]);

  // Parameters
  // TODO: add metrics as well
  const paramFields = { ...fields.params.paramFields };
  const paramFieldsPaths = [];
  Object.keys(flattenObject(paramFields)).forEach((paramPrefix) => {
    !!paramFields[paramPrefix] &&
      paramFields[paramPrefix].forEach((paramName) => {
        paramFieldsPaths.push(`params.${paramPrefix}.${paramName}`);
      });
  });
  transformNestedArrToObj(paramFields);
  searchNestedObject(paramFields, searchInput.split('.'));
  removeObjectEmptyKeys(paramFields);

  function handleFieldToggle(path) {
    let updExcludedFields = [...excludedFields];
    if (updExcludedFields.indexOf(path) !== -1) {
      updExcludedFields = updExcludedFields.filter((i) => i !== path);
    } else {
      updExcludedFields.push(path);
    }
    updExcludedFields = _.uniq(updExcludedFields.filter((i) => !!i));
    setExcludedFields(updExcludedFields);
  }

  const styles = {};
  if (!!maxHeight && maxHeight < 300) {
    styles.maxHeight = `${maxHeight}px`;
  }

  return (
    <div className='ContextTableBar__item__wrapper'>
      {opened && (
        <div
          className='ContextTableBar__item__popup BarFilter'
          tabIndex={0}
          ref={popupRef}
          style={styles}
          onBlur={(evt) => {
            const currentTarget = evt.currentTarget;
            if (opened) {
              window.setTimeout(() => {
                if (!currentTarget.contains(document.activeElement)) {
                  setOpened(false);
                }
              }, 100);
            }
          }}
        >
          {paramFieldsPaths.length ? (
            <div className='BarFilter__content'>
              <div className='BarFilter__body'>
                <div className='BarFilter__form__wrapper'>
                  <UI.Input
                    className='BarFilter__input'
                    value={searchInput}
                    onChange={(evt) => setSearchInput(evt.target.value)}
                    placeholder='Search fields...'
                    size='small'
                    ref={searchRef}
                  />
                </div>
                <div className='BarFilter__parameters__box'>
                  {!!paramFields && Object.keys(paramFields).length ? (
                    <Parameters
                      params={paramFields}
                      parentPath={[]}
                      excludedFields={excludedFields}
                      toggleField={handleFieldToggle}
                    />
                  ) : (
                    <UI.Text type='grey' spacingTop spacing center small>
                      No options
                    </UI.Text>
                  )}
                </div>
              </div>
              <div className='BarFilter__footer'>
                <div className='BarFilter__actions'>
                  <UI.Button
                    className='BarFilter__action'
                    type='positive'
                    size='tiny'
                    disabled={excludedFields.length === 0}
                    onClick={() => setExcludedFields([])}
                  >
                    Show all
                  </UI.Button>
                  <UI.Button
                    className='BarFilter__action'
                    type='negative'
                    size='tiny'
                    disabled={excludedFields.length === paramFieldsPaths.length}
                    onClick={() => setExcludedFields(paramFieldsPaths)}
                  >
                    Hide all
                  </UI.Button>
                </div>
              </div>
            </div>
          ) : (
            <UI.Text type='grey' spacingTop center small>
              No options
            </UI.Text>
          )}
        </div>
      )}
      <div
        className={classNames({
          ContextTableBar__item__label: true,
          active: opened || (!!excludedFields && excludedFields.length),
        })}
        onClick={() => setOpened(!opened)}
      >
        <UI.Icon i='filter_alt' scale={1.2} />
        <span className='ContextTableBar__item__label__text'>
          {!!excludedFields && excludedFields.length
            ? `${excludedFields.length} Hidden Field${
                excludedFields.length > 1 ? 's' : ''
              }`
            : 'Hide Fields'}
        </span>
      </div>
    </div>
  );
}

BarFilter.defaultProps = {
  excludedFields: [],
  setExcludedFields: null,
  maxHeight: null,
  fields: {
    params: {},
    metrics: [],
  },
};

BarFilter.propTypes = {
  excludedFields: PropTypes.array,
  setExcludedFields: PropTypes.func,
  maxHeight: PropTypes.number,
  fields: PropTypes.object,
};

function Parameter({ paramKey, parentPath, excludedFields, toggleField }) {
  const path = `params.${parentPath.join('.')}.${paramKey}`;
  const on = excludedFields.indexOf(path) === -1;

  return (
    <div
      className={classNames({
        BarFilter__group__item: true,
        on: on,
      })}
      key={path}
      onClick={() => toggleField(path)}
    >
      <div className='BarFilter__group__item__radio__wrapper'>
        {on ? <UI.Icon i='toggle_on' /> : <UI.Icon i='toggle_off' />}
      </div>
      <div className='BarFilter__group__item__row name'>
        {[...Array(parentPath.length)].map((_, i) => (
          <div className='BarFilter__group__item__placeholder' key={i} />
        ))}
        <div className='BarFilter__group__item__name' title={path}>
          {paramKey}
        </div>
      </div>
    </div>
  );
}

function Parameters({ params, parentPath, excludedFields, toggleField }) {
  const key = (k) => `${parentPath.join('.')}.${k}`;

  return (
    !!params &&
    Object.keys(params).map((paramKey) => (
      <Fragment key={key(paramKey)}>
        {typeof params[paramKey] === 'boolean' && (
          <Parameter
            paramKey={paramKey}
            parentPath={parentPath}
            excludedFields={excludedFields}
            toggleField={toggleField}
          />
        )}

        {typeof params[paramKey] === 'object' && (
          <div className='BarFilter__group' key={key(paramKey)}>
            <div className='BarFilter__group__item__row group'>
              {[...Array(parentPath.length + 1)].map((_, i) => (
                <div className='BarFilter__group__item__placeholder' key={i} />
              ))}
              <div className='BarFilter__group__title'>
                <div className='BarFilter__group__title__placeholder' />
                <div className='BarFilter__group__title__label'>{paramKey}</div>
              </div>
            </div>
            <div className='BarFilter__group__body'>
              <Parameters
                key={key(paramKey)}
                params={params[paramKey]}
                parentPath={[...parentPath, paramKey]}
                excludedFields={excludedFields}
                toggleField={toggleField}
              />
            </div>
          </div>
        )}
      </Fragment>
    ))
  );
}

export default BarFilter;
