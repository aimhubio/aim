import './ContextTable.less';

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import UI from '../../../ui';
import { classNames } from '../../../utils';
import BarRowHeightSelect from './components/BarRowHeightSelect/BarRowHeightSelect';
import BarViewModes from '../BarViewModes/BarViewModes';
import BarSort from './components/BarSort/BarSort';
import BarReorder from './components/BarReorder/BarReorder';
import BarRowVisualization from './components/BarRowVisualization/BarRowVisualization';
import BarExport from './components/BarExport/BarExport';

function ContextTable(props) {
  let contextTableContainerRef = useRef();
  let contextTableRef = useRef();

  function updateColumns(columns, reset = false) {
    let order;
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
    props.setColumnsOrder(order);
  }

  function updateColumnsWidths(colKey, width, reset = false) {
    let columnsWidthsClone;
    if (reset) {
      columnsWidthsClone = _.omit(props.columnsWidths, [colKey]);
    } else {
      columnsWidthsClone = _.clone(props.columnsWidths);
      columnsWidthsClone[colKey] = width;
    }
    props.setColumnsWidths(columnsWidthsClone);
  }

  const height =
    contextTableContainerRef.current?.getBoundingClientRect()?.height;
  const itemMaxHeight = !!height ? height - 50 : null;

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
        [`ContextTable--${props.rowHeightMode}`]: true,
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
              columnsOrder={props.columnsOrder}
              updateColumns={updateColumns}
              excludedFields={props.excludedFields}
              setExcludedFields={props.setExcludedFields}
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
              rowHeightMode={props.rowHeightMode}
              setRowHeightMode={props.setRowHeightMode}
            />
          </div>
          <div className='ContextTableBar__items ContextTableBar__items--right'>
            {props.exportData && <BarExport exportData={props.exportData} />}
          </div>
        </div>
      )}
      <div
        className={classNames({
          ContextTable__table: true,
          [props.rowHeightMode]: true,
        })}
        ref={contextTableRef}
      >
        <UI.Table
          excludedFields={props.excludedFields}
          setExcludedFields={props.setExcludedFields}
          alwaysVisibleColumns={props.alwaysVisibleColumns}
          rowHeightMode={props.rowHeightMode}
          columnsOrder={props.columnsOrder}
          updateColumns={updateColumns}
          columnsWidths={props.columnsWidths}
          updateColumnsWidths={updateColumnsWidths}
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
  rowHeightMode: PropTypes.string,
  setRowHeightMode: PropTypes.func,
  excludedFields: PropTypes.array,
  setExcludedFields: PropTypes.func,
  columnsOrder: PropTypes.object,
  setColumnsOrder: PropTypes.func,
  columnsWidths: PropTypes.object,
  setColumnsWidths: PropTypes.func,
  getParamsWithSameValue: PropTypes.func,
  getTableContainerElement: PropTypes.func,
  exportData: PropTypes.func,
};

export default ContextTable;
