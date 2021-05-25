import './ContextTable.less';

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import UI from '../../../ui';
import { classNames } from '../../../utils';
import BarFilter from './components/BarFilter/BarFilter';
import BarRowHeightSelect from './components/BarRowHeightSelect/BarRowHeightSelect';
import BarViewModes from '../BarViewModes/BarViewModes';
import { setItem, getItem } from '../../../services/storage';
import {
  CONTEXT_TABLE_CONFIG,
  TABLE_COLUMNS,
  TABLE_COLUMNS_WIDTHS,
} from '../../../config';
import BarSort from './components/BarSort/BarSort';
import BarReorder from './components/BarReorder/BarReorder';
import BarRowVisualization from './components/BarRowVisualization/BarRowVisualization';
import { ContextTableModel } from './models/ContextTableModel';

function ContextTable(props) {
  const storageKey = CONTEXT_TABLE_CONFIG.replace('{name}', props.name);
  let storageVal;
  try {
    storageVal = getItem(storageKey);
    storageVal = JSON.parse(storageVal);
  } catch (e) {
    storageVal = {};
  }

  let contextTableContainerRef = useRef();
  let contextTableRef = useRef();

  let [excludedFields, setExcludedFields] = useState(
    storageVal?.excludedFields ?? [],
  );
  let [rowHeightMode, setRowHeightMode] = useState(
    storageVal?.rowHeightMode ?? 'medium',
  );
  let [columnsOrder, setColumnsOrder] = useState({
    left: [],
    middle: [],
    right: [],
  });
  let [columnsWidth, setColumnsWidth] = useState(
    JSON.parse(getItem(TABLE_COLUMNS_WIDTHS))?.[props.name] ?? {},
  );

  function updateColumns(columns, reset = false) {
    let order;
    const tableColumns = JSON.parse(getItem(TABLE_COLUMNS)) ?? {};
    if (reset) {
      order = {
        left: [],
        middle: [],
        right: [],
      };
      props.columns.forEach((col) => {
        if (col.pin === 'left') {
          order.left.push(col.key);
        } else if (col.pin === 'right') {
          order.right.push(col.key);
        } else {
          order.middle.push(col.key);
        }
      });
    } else {
      order = columns;
    }
    tableColumns[props.name] = order;
    setColumnsOrder(order);
    setItem(TABLE_COLUMNS, JSON.stringify(tableColumns));
  }

  function updateColumnsWidth(colKey, width, reset = false) {
    const tableColumnsWidths = JSON.parse(getItem(TABLE_COLUMNS_WIDTHS)) ?? {};
    let columnsWidthClone;
    if (reset) {
      columnsWidthClone = _.omit(columnsWidth, [colKey]);
    } else {
      columnsWidthClone = _.clone(columnsWidth);
      columnsWidthClone[colKey] = width;
    }
    tableColumnsWidths[props.name] = columnsWidthClone;
    setItem(TABLE_COLUMNS_WIDTHS, JSON.stringify(tableColumnsWidths));
    setColumnsWidth(columnsWidthClone);
  }

  const height =
    contextTableContainerRef.current?.getBoundingClientRect()?.height;
  const itemMaxHeight = !!height ? height - 50 : null;

  useEffect(() => {
    const subscription = ContextTableModel.subscribe(
      ContextTableModel.events.SET_GROUPED_COLUMNS,
      (data) => {
        if (props.name === data.name) {
          const columnsOrderClone = _.cloneDeep(columnsOrder);
          data.columns.forEach((column) => {
            if (columnsOrderClone.middle.includes(column)) {
              columnsOrderClone.middle.splice(
                columnsOrderClone.middle.indexOf(column),
                1,
              );
              columnsOrderClone.middle.unshift(column);
            }
          });
          updateColumns(columnsOrderClone);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [columnsOrder]);

  useEffect(() => {
    setItem(
      storageKey,
      JSON.stringify({
        rowHeightMode,
        excludedFields,
      }),
    );
  }, [rowHeightMode, excludedFields]);

  useEffect(() => {
    const tableColumns = JSON.parse(getItem(TABLE_COLUMNS))?.[props.name];
    const order = {
      left: [],
      middle: [],
      right: [],
    };
    props.columns.forEach((col) => {
      if (!!tableColumns && tableColumns.left.includes(col.key)) {
        order.left.push(col.key);
      } else if (!!tableColumns && tableColumns.middle.includes(col.key)) {
        order.middle.push(col.key);
      } else if (!!tableColumns && tableColumns.right.includes(col.key)) {
        order.right.push(col.key);
      } else {
        if (col.pin === 'left') {
          order.left.push(col.key);
        } else if (col.pin === 'right') {
          order.right.push(col.key);
        } else {
          order.middle.push(col.key);
        }
      }
    });
    order.left.sort((a, b) => {
      if (!!tableColumns) {
        if (tableColumns.left.indexOf(b) === -1) {
          return -1;
        }
        if (tableColumns.left.indexOf(a) === -1) {
          return 1;
        }
        return tableColumns.left.indexOf(a) - tableColumns.left.indexOf(b);
      }
      return 0;
    });
    order.middle.sort((a, b) => {
      if (!!tableColumns) {
        if (tableColumns.middle.indexOf(b) === -1) {
          return -1;
        }
        if (tableColumns.middle.indexOf(a) === -1) {
          return 1;
        }
        return tableColumns.middle.indexOf(a) - tableColumns.middle.indexOf(b);
      }
      return 0;
    });
    order.right.sort((a, b) => {
      if (!!tableColumns) {
        if (tableColumns.right.indexOf(b) === -1) {
          return -1;
        }
        if (tableColumns.right.indexOf(a) === -1) {
          return 1;
        }
        return tableColumns.right.indexOf(a) - tableColumns.right.indexOf(b);
      }
      return 0;
    });
    setColumnsOrder(order);
  }, [props.columns]);

  useEffect(() => {
    if (typeof props.getTableContainerElement === 'function') {
      props.getTableContainerElement(contextTableRef.current);
    }
  }, []);

  return (
    <div
      className={classNames({
        ContextTable: true,
        'ContextTable--displayBar': true,
        [`ContextTable--${rowHeightMode}`]: true,
      })}
      ref={contextTableContainerRef}
    >
      {props.displayBar && (
        <div
          className={classNames({
            ContextTableBar: true,
          })}
        >
          <div className='ContextTableBar__items ContextTableBar__items--left'>
            {props.displayViewModes && (
              <BarViewModes
                viewMode={props.viewMode}
                setViewMode={props.setViewMode}
              />
            )}
            {/* <BarFilter
              excludedFields={excludedFields}
              setExcludedFields={setExcludedFields}
              maxHeight={itemMaxHeight}
              fields={props.searchFields}
            /> */}
            <BarReorder
              columns={props.columns}
              columnsOrder={columnsOrder}
              updateColumns={updateColumns}
              excludedFields={excludedFields}
              setExcludedFields={setExcludedFields}
              alwaysVisibleColumns={props.alwaysVisibleColumns}
              getParamsWithSameValue={props.getParamsWithSameValue}
            />
            {props.hiddenMetrics && (
              <BarRowVisualization
                hiddenMetrics={props.hiddenMetrics}
                setHiddenMetrics={props.setHiddenMetrics}
              />
            )}
            {props.displaySort && (
              <BarSort
                sortFields={props.sortFields}
                setSortFields={props.setSortFields}
                maxHeight={itemMaxHeight}
                fields={props.searchFields}
              />
            )}
            <BarRowHeightSelect
              rowHeightMode={rowHeightMode}
              setRowHeightMode={setRowHeightMode}
            />
          </div>
          <div className='ContextTableBar__items ContextTableBar__items--right' />
        </div>
      )}
      <div
        className={classNames({
          ContextTable__table: true,
          [rowHeightMode]: true,
        })}
        ref={contextTableRef}
      >
        <UI.Table
          excludedFields={excludedFields}
          setExcludedFields={setExcludedFields}
          alwaysVisibleColumns={props.alwaysVisibleColumns}
          rowHeightMode={rowHeightMode}
          columnsOrder={columnsOrder}
          updateColumns={updateColumns}
          columnsWidth={columnsWidth}
          updateColumnsWidth={updateColumnsWidth}
          sortFields={props.sortFields}
          setSortFields={props.setSortFields}
          {...props}
        />
      </div>
    </div>
  );
}

ContextTable.defaultProps = {
  displayBar: true,
  displayViewModes: false,
  viewMode: null,
  setViewMode: null,
  displaySort: false,
  sortFields: [],
  alwaysVisibleColumns: [],
  hiddenMetrics: null,
};

ContextTable.propTypes = {
  displayBar: PropTypes.bool,
  searchFields: PropTypes.object,
  displayViewModes: PropTypes.bool,
  viewMode: PropTypes.string,
  setViewMode: PropTypes.func,
  displaySort: PropTypes.bool,
  sortFields: PropTypes.array,
  setSortFields: PropTypes.func,
  alwaysVisibleColumns: PropTypes.array,
  hiddenMetrics: PropTypes.array,
  setHiddenMetrics: PropTypes.func,
  getParamsWithSameValue: PropTypes.func,
  getTableContainerElement: PropTypes.func,
};

export default ContextTable;
