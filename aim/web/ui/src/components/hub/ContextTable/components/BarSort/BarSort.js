import './BarSort.less';

import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  classNames,
  flattenObject,
  removeObjectEmptyKeys,
  searchNestedObject,
} from '../../../../../utils';
import UI from '../../../../../ui';
import * as _ from 'lodash';
import * as analytics from '../../../../../services/analytics';

function BarSort({ sortFields, setSortFields, maxHeight, fields }) {
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
  const paramFields = _.cloneDeep(fields.params.deepParamFields);
  const paramFieldsPaths = [];
  if (paramFields && !_.isEmpty(paramFields)) {
    Object.keys(flattenObject(paramFields)).forEach((paramPath) => {
      paramFieldsPaths.push(`params.${paramPath}`);
      _.set(paramFields, paramPath, true);
    });
    searchNestedObject(paramFields, searchInput.split('.'));
    sortFields
      .map((f) => (f[0].startsWith('params.') ? f[0].substring(7) : f[0]))
      .forEach((paramPath) => {
        _.set(paramFields, paramPath, false);
      });
    removeObjectEmptyKeys(paramFields);
  }

  // Metrics
  const metricFields = _.cloneDeep(fields.metrics);
  const metricFieldsPaths = [];
  if (metricFields && !_.isEmpty(metricFields)) {
    Object.keys(flattenObject(metricFields)).forEach((metricPath) => {
      metricFieldsPaths.push(`params.metrics.${metricPath}`);
      _.set(metricFields, metricPath, true);
    });
    searchNestedObject(metricFields, searchInput.split('.'));
    sortFields
      .map((f) =>
        f[0].startsWith('params.metrics.') ? f[0].substring(15) : f[0],
      )
      .forEach((metricPath) => {
        _.set(metricFields, metricPath, false);
      });
    removeObjectEmptyKeys(metricFields);
  }

  function handleFieldToggle(path, order = 'asc') {
    let updSortFields = [...sortFields];
    if (updSortFields.findIndex((field) => field[0] === path) > -1) {
      if (order === 'remove') {
        updSortFields = updSortFields.filter((field) => field[0] !== path);
      } else if (
        order !== updSortFields.findIndex((field) => field[0] === path)[1]
      ) {
        updSortFields = updSortFields.map((field) =>
          field[0] === path ? [field[0], order] : field,
        );
      }
      analytics.trackEvent('[Table] Reset table sorting by a key');
    } else {
      updSortFields.push([path, order]);
      analytics.trackEvent('[Table] Apply table sorting by a key');
    }
    updSortFields = _.uniqBy(
      updSortFields.filter((f) => !!f[0]),
      '[0]',
    );
    setSortFields(updSortFields);
  }

  const styles = {};
  if (!!maxHeight && maxHeight < 300) {
    styles.maxHeight = `${maxHeight}px`;
  }

  return (
    <div className='ContextTableBar__item__wrapper'>
      {opened && (
        <div
          className='ContextTableBar__item__popup BarSort'
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
          {paramFieldsPaths.length || metricFieldsPaths.length ? (
            <div className='BarSort__content'>
              <div className='BarSort__body'>
                {sortFields.length > 0 && (
                  <div className='BarSort__selected'>
                    <UI.Text type='primary' overline bold>
                      Sorted by
                    </UI.Text>
                    {sortFields.map((field, i) => (
                      <div key={field[0]} className='BarSort__selected__item'>
                        <div
                          className='BarSort__selected__item__close'
                          onClick={() => handleFieldToggle(field[0], 'remove')}
                          onMouseMove={(evt) =>
                            (evt.currentTarget.parentNode.style.backgroundColor =
                              'var(--grey-bg)')
                          }
                          onMouseOut={(evt) =>
                            (evt.currentTarget.parentNode.style.backgroundColor =
                              'inherit')
                          }
                        >
                          <UI.Icon i='close' />
                        </div>
                        <UI.Text
                          small
                          className='BarSort__selected__item__field'
                        >
                          <span title={field[0].replace(' No context', '')}>
                            {field[0].replace(' No context', '')}
                          </span>
                        </UI.Text>
                        <div className='BarSort__selected__item__order'>
                          <span
                            className={classNames({
                              BarSort__selected__item__order__item: true,
                              active: field[1] === 'asc',
                            })}
                            onClick={
                              field[1] === 'asc'
                                ? null
                                : () => handleFieldToggle(field[0], 'asc')
                            }
                          >
                            <UI.Text small>asc</UI.Text>
                          </span>
                          <span
                            className={classNames({
                              BarSort__selected__item__order__item: true,
                              active: field[1] === 'desc',
                            })}
                            onClick={
                              field[1] === 'desc'
                                ? null
                                : () => handleFieldToggle(field[0], 'desc')
                            }
                          >
                            <UI.Text small>desc</UI.Text>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className='BarSort__form__wrapper'>
                  <UI.Input
                    className='BarSort__input'
                    value={searchInput}
                    onChange={(evt) => setSearchInput(evt.target.value)}
                    placeholder='Search fields...'
                    size='small'
                    ref={searchRef}
                  />
                </div>
                <div className='BarSort__parameters__box'>
                  {(!!paramFields && Object.keys(paramFields).length > 0) ||
                  (!!metricFields && Object.keys(metricFields).length > 0) ? (
                    <>
                      {!!metricFields &&
                        Object.keys(metricFields).length > 0 && (
                        <Parameters
                          params={metricFields}
                          parentPath={[]}
                          sortFields={sortFields}
                          toggleField={handleFieldToggle}
                          metric
                        />
                      )}
                      {!!paramFields && Object.keys(paramFields).length > 0 && (
                        <Parameters
                          params={paramFields}
                          parentPath={[]}
                          sortFields={sortFields}
                          toggleField={handleFieldToggle}
                        />
                      )}
                    </>
                    ) : (
                      <UI.Text type='grey' spacingTop spacing center small>
                      No options
                      </UI.Text>
                    )}
                </div>
              </div>
              <div className='BarSort__footer'>
                <div className='BarSort__actions'>
                  <UI.Button
                    className='BarSort__action'
                    type='negative'
                    size='tiny'
                    disabled={sortFields.length === 0}
                    onClick={() => {
                      setSortFields([]);
                      analytics.trackEvent('[Table] Reset table sorting');
                    }}
                  >
                    Reset sorting
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
          active: opened || (!!sortFields && sortFields.length),
        })}
        onClick={() => setOpened(!opened)}
      >
        <UI.Icon i='import_export' scale={1.2} />
        <span className='ContextTableBar__item__label__text'>
          {!!sortFields && sortFields.length
            ? `Sorted by ${sortFields.length} field${
                sortFields.length > 1 ? 's' : ''
              }`
            : 'Sort'}
        </span>
      </div>
    </div>
  );
}

BarSort.defaultProps = {
  sortFields: [],
  setSortFields: null,
  maxHeight: null,
  fields: {
    params: {},
    metrics: [],
  },
};

BarSort.propTypes = {
  sortFields: PropTypes.array,
  setSortFields: PropTypes.func,
  maxHeight: PropTypes.number,
  fields: PropTypes.object,
};

function Parameter({ paramKey, parentPath, toggleField, metric }) {
  const path = metric
    ? `${parentPath.join('.')} ${paramKey}`
    : `${parentPath.join('.')}.${paramKey}`;

  return (
    <div
      className={classNames({
        BarSort__group__item: true,
      })}
      key={path}
      onClick={() => toggleField(path)}
    >
      <div className='BarSort__group__item__radio__wrapper'>
        <UI.Icon i='import_export' />
      </div>
      <div className='BarSort__group__item__row name'>
        {[...Array(parentPath.length)].map((_, i) => (
          <div className='BarSort__group__item__placeholder' key={i} />
        ))}
        <div className='BarSort__group__item__name' title={path}>
          {paramKey === 'No context' ? (
            <span className='BarSort__group__item__name__meta'>{paramKey}</span>
          ) : (
            paramKey
          )}
        </div>
      </div>
    </div>
  );
}

function Parameters({ params, parentPath, sortFields, toggleField, metric }) {
  const key = (k) => `${parentPath.join('.')}.${k}`;
  const unselectedParams =
    !!params &&
    Object.keys(params)
      .filter((paramKey) => {
        const path = metric
          ? `${parentPath.join('.')} ${paramKey}`
          : `${parentPath.join('.')}.${paramKey}`;
        const off = sortFields.findIndex((field) => field[0] === path) === -1;
        return off;
      })
      .sort();

  return unselectedParams?.map((paramKey) => (
    <Fragment key={key(paramKey)}>
      {typeof params[paramKey] === 'boolean' && (
        <Parameter
          paramKey={paramKey}
          parentPath={parentPath}
          toggleField={toggleField}
          metric={metric}
        />
      )}
      {typeof params[paramKey] === 'object' &&
        Object.keys(params[paramKey]).filter((key) => {
          const path = metric ? `${paramKey} ${key}` : `${paramKey}.${key}`;
          const off = sortFields.findIndex((field) => field[0] === path) === -1;
          return off;
        }).length > 0 && (
        <div className='BarSort__group' key={key(paramKey)}>
          <div className='BarSort__group__item__row group'>
            {[...Array(parentPath.length + 1)].map((_, i) => (
              <div className='BarSort__group__item__placeholder' key={i} />
            ))}
            <div className='BarSort__group__title'>
              <div className='BarSort__group__title__placeholder' />
              <div className='BarSort__group__title__label'>{paramKey}</div>
            </div>
          </div>
          <div className='BarSort__group__body'>
            <Parameters
              key={key(paramKey)}
              params={params[paramKey]}
              parentPath={[...parentPath, paramKey]}
              sortFields={sortFields}
              toggleField={toggleField}
              metric={metric}
            />
          </div>
        </div>
      )}
    </Fragment>
  ));
}

export default BarSort;
