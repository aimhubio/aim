// @ts-nocheck
/* eslint-disable react/prop-types */

import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import { isEmpty } from 'lodash-es';

import { Checkbox } from '@material-ui/core';

import { Icon } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import {
  ROW_CELL_SIZE_CONFIG,
  COLORED_SELECTION_COLUMN_WIDTH,
  SELECTION_COLUMN_WIDTH,
  RowHeightSize,
} from 'config/table/tableConfigs';

import getClosestValue from 'utils/getClosestValue';

import Column from './TableColumn';

import './Table.scss';

function Table(props) {
  const columns = props.columns;
  let leftCols = columns
    .filter((col) => col.pin === 'left')
    .map((col) => col.key);

  let midCols = columns
    .filter((col) => col.pin !== 'left' && col.pin !== 'right')
    .map((col) => col.key);

  let rightCols = columns
    .filter((col) => col.pin === 'right')
    .map((col) => col.key);
  let [expanded, setExpanded] = useState({});
  let [colWidths, setColWidths] = useState({});
  let [colLefts, setColLefts] = useState({});
  let [middlePaneWindow, setMiddlePaneWindow] = useState([]);

  let prevExpanded = useRef(props.expanded ?? {});

  const leftPane = columns
    .filter((col) => leftCols.includes(col.key))
    .sort((a, b) => leftCols.indexOf(a.key) - leftCols.indexOf(b.key));
  const middlePane = columns
    .filter((col) => midCols.includes(col.key))
    .sort((a, b) => midCols.indexOf(a.key) - midCols.indexOf(b.key));
  const rightPane = columns
    .filter((col) => rightCols.includes(col.key))
    .sort((a, b) => rightCols.indexOf(a.key) - rightCols.indexOf(b.key));
  const sortedColumns = [...leftPane, ...middlePane, ...rightPane];

  const groups = !Array.isArray(props.data);

  useEffect(() => {
    if (props.expanded && groups) {
      for (let groupKey in props.expanded) {
        if (
          props.expanded[groupKey] &&
          prevExpanded.current[groupKey] !== props.expanded[groupKey]
        ) {
          setExpanded((exp) => ({
            ...exp,
            [groupKey]: true,
          }));
        }
      }
    }
    prevExpanded.current = props.expanded ?? {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.expanded]);

  useEffect(() => {
    let rAFRef = window.requestAnimationFrame(() => {
      let left = 0;
      let lefts = {};
      Object.keys(colWidths)
        .sort((a, b) => +a - +b)
        .forEach((i) => {
          lefts[i] = left;
          left += Math.ceil(colWidths[i]);
        });
      setColLefts(lefts);
    });

    return () => {
      window.cancelAnimationFrame(rAFRef);
    };
  }, [colWidths]);

  useEffect(
    () => {
      let rAFRef = window.requestAnimationFrame(() => {
        const lefts = Object.values(colLefts);

        let leftClosest = getClosestValue(lefts, props.listWindow.left).index;
        let rightClosest = lefts.length - 1;

        for (let i = leftClosest; i < lefts.length; i++) {
          if (lefts[i] > props.listWindow.left + props.listWindow.width) {
            rightClosest = i;
            break;
          }
        }

        let left = leftClosest < 6 ? 0 : leftClosest - 5;
        let right = rightClosest + 5;

        setMiddlePaneWindow((mPW) =>
          middlePane
            .slice(left, right + (mPW.length === 0 ? 50 : 0)) // calculate first 50 columns widths and lefts on initial render
            ?.map((col, i) => ({
              ...col,
              colIndex: left + i,
            })),
        );
      });

      return () => {
        window.cancelAnimationFrame(rAFRef);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.listWindow.left, props.listWindow.width, colLefts, columns],
  );

  const color = React.useMemo(
    () => props.data[0]?.rowMeta?.color,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.data[0]?.rowMeta?.color],
  );

  function expand(groupKey) {
    if (groupKey === 'expand_all') {
      let groupsForExpansion = {};
      for (let key in props.data) {
        groupsForExpansion[key] = true;
        prevExpanded.current[key] = true;
      }
      setExpanded({
        ...expanded,
        ...groupsForExpansion,
      });
      if (typeof props.onGroupExpandToggle === 'function') {
        props.onGroupExpandToggle(Object.keys(props.data));
      }
    } else if (groupKey === 'collapse_all') {
      for (let key in props.data) {
        prevExpanded.current[key] = false;
      }
      setExpanded({});
      if (typeof props.onGroupExpandToggle === 'function') {
        props.onGroupExpandToggle([]);
      }
    } else {
      prevExpanded.current[groupKey] = !expanded[groupKey];
      setExpanded({
        ...expanded,
        [groupKey]: !expanded[groupKey],
      });
      if (typeof props.onGroupExpandToggle === 'function') {
        props.onGroupExpandToggle(groupKey);
      }
    }
  }

  function togglePin(colKey, side) {
    const columnsOrderClone = {
      left: leftCols,
      middle: midCols,
      right: rightCols,
    };
    if (side === 'left') {
      if (columnsOrderClone.left.includes(colKey)) {
        columnsOrderClone.left.splice(
          columnsOrderClone.left.indexOf(colKey),
          1,
        );
        columnsOrderClone.middle.unshift(colKey);
      } else {
        if (columnsOrderClone.right.includes(colKey)) {
          columnsOrderClone.right.splice(
            columnsOrderClone.right.indexOf(colKey),
            1,
          );
        } else {
          columnsOrderClone.middle.splice(
            columnsOrderClone.middle.indexOf(colKey),
            1,
          );
        }
        columnsOrderClone.left.push(colKey);
      }
    } else if (side === 'right') {
      if (columnsOrderClone.right.includes(colKey)) {
        columnsOrderClone.right.splice(
          columnsOrderClone.right.indexOf(colKey),
          1,
        );
        columnsOrderClone.middle.unshift(colKey);
      } else {
        if (columnsOrderClone.left.includes(colKey)) {
          columnsOrderClone.left.splice(
            columnsOrderClone.left.indexOf(colKey),
            1,
          );
        } else {
          columnsOrderClone.middle.splice(
            columnsOrderClone.middle.indexOf(colKey),
            1,
          );
        }
        columnsOrderClone.right.push(colKey);
      }
    } else {
      if (columnsOrderClone.left.includes(colKey)) {
        columnsOrderClone.left.splice(
          columnsOrderClone.left.indexOf(colKey),
          1,
        );
      }
      if (columnsOrderClone.right.includes(colKey)) {
        columnsOrderClone.right.splice(
          columnsOrderClone.right.indexOf(colKey),
          1,
        );
      }
      columnsOrderClone.middle.unshift(colKey);
    }
    props.updateColumns(columnsOrderClone);
  }

  function moveColumn(colKey, pane, from, direction) {
    const columnsOrderClone = {
      left: leftCols,
      middle: midCols,
      right: rightCols,
    };
    let to;
    switch (direction) {
      case 'left':
        to = from - 1;
        break;
      case 'right':
        to = from + 1;
        break;
      case 'start':
        to = 0;
        break;
      case 'end':
        to = columnsOrderClone[pane].length - 1;
        break;
    }
    columnsOrderClone[pane].splice(from, 1);
    columnsOrderClone[pane].splice(to, 0, colKey);
    props.updateColumns(columnsOrderClone);
  }

  function showTopHeaderContent(index, colTopHeader, add) {
    return (
      props.topHeader &&
      sortedColumns[add ? index + 1 : index - 1]?.topHeader !== colTopHeader
    );
  }

  let midPaneWidth =
    colLefts[Object.keys(colLefts).length - 1] +
    colWidths[Object.keys(colWidths).length - 1];

  if (midPaneWidth < props.listWindow.availableSpace) {
    midPaneWidth = null;
  }

  useEffect(
    () => {
      if (middlePane.length < Object.keys(colLefts).length) {
        let widths = {};
        middlePaneWindow.forEach((col) => {
          widths[col.colIndex] = colWidths[col.colIndex];
        });
        setColWidths(widths);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [middlePaneWindow, colLefts],
  );

  return (
    <ErrorBoundary>
      <div
        className={classNames('Table__container', {
          [`Table__container--${
            ROW_CELL_SIZE_CONFIG[props.rowHeightMode]?.name ??
            ROW_CELL_SIZE_CONFIG[RowHeightSize.md].name
          }`]: true,
        })}
      >
        <div
          className={classNames('Table', {
            'Table--grouped': groups,
          })}
        >
          {!groups && props.multiSelect && Array.isArray(props.data) && (
            <ErrorBoundary key={'selection'}>
              <div
                className={classNames('Table__pane Table__pane--selection', {
                  withShadow: leftPane.length === 0,
                })}
              >
                <Column
                  noColumnActions={props.noColumnActions}
                  topHeader={true}
                  showTopHeaderContent={true}
                  showTopHeaderBorder={true}
                  col={{
                    isHidden: false,
                    key: 'selection',
                    pin: 'left',
                    topHeader: '',
                    content: (
                      <Checkbox
                        color='primary'
                        size='small'
                        className={classNames('Table__column__selectCheckbox', {
                          Table__column__headerCheckbox: color,
                        })}
                        icon={
                          <span className='Table__column__defaultSelectIcon'></span>
                        }
                        checkedIcon={
                          props.data.length ===
                          Object.keys(props.selectedRows).length ? (
                            <span className='Table__column__selectedSelectIcon'>
                              <Icon name='check' fontSize={9} />
                            </span>
                          ) : (
                            <span className='Table__column__partiallySelectedSelectIcon'>
                              <Icon name='partially-selected' fontSize={14} />
                            </span>
                          )
                        }
                        onClick={() =>
                          props.onRowSelect({
                            actionType: isEmpty(props.selectedRows)
                              ? 'selectAll'
                              : 'removeAll',
                            data: props.data,
                          })
                        }
                        checked={!isEmpty(props.selectedRows)}
                      />
                    ),
                  }}
                  data={props.data}
                  expanded={expanded}
                  expand={expand}
                  onRowSelect={props.onRowSelect}
                  onRowClick={props.onRowClick}
                  selectedRows={props.selectedRows}
                  firstColumn={true}
                  rowHeightMode={props.rowHeightMode}
                  width={
                    color
                      ? COLORED_SELECTION_COLUMN_WIDTH
                      : SELECTION_COLUMN_WIDTH
                  }
                  isAlwaysVisible={true}
                  onRowHover={props.onRowHover}
                  listWindow={props.listWindow}
                />
              </div>
            </ErrorBoundary>
          )}
          {(groups || leftPane.length > 0) && (
            <div
              className={classNames('Table__pane Table__pane--left', {
                withSelectionColumn: props.multiSelect && !groups,
                onlyGroupColumn: leftPane.length === 0,
              })}
              style={{
                '--left-position': `${
                  color
                    ? COLORED_SELECTION_COLUMN_WIDTH
                    : SELECTION_COLUMN_WIDTH
                }px`,
              }}
            >
              {leftPane.map((col, index) => (
                <ErrorBoundary key={col.key}>
                  <Column
                    noColumnActions={props.noColumnActions}
                    topHeader={props.topHeader}
                    showTopHeaderContent={showTopHeaderContent(
                      index,
                      col.topHeader,
                    )}
                    showTopHeaderBorder={showTopHeaderContent(
                      index,
                      col.topHeader,
                      true,
                    )}
                    col={col}
                    data={props.data}
                    expanded={expanded}
                    expand={expand}
                    togglePin={togglePin}
                    pinnedTo='left'
                    firstColumn={index === 0}
                    width={props.columnsWidths?.[col.key]}
                    updateColumnWidth={props.updateColumnsWidths}
                    headerMeta={props.headerMeta}
                    onToggleColumnsColorScales={
                      props.onToggleColumnsColorScales
                    }
                    columnsColorScales={props.columnsColorScales}
                    isAlwaysVisible={props.alwaysVisibleColumns?.includes(
                      col.key,
                    )}
                    hideColumn={() =>
                      props.setExcludedFields?.([
                        ...(props.excludedFields || []),
                        col.key,
                      ])
                    }
                    multiSelect={props.multiSelect}
                    paneFirstColumn={index === 0}
                    paneLastColumn={index === leftPane.length - 1}
                    rowHeightMode={props.rowHeightMode}
                    moveColumn={(dir) =>
                      moveColumn(col.key, 'left', index, dir)
                    }
                    sortable={
                      col.sortableKey &&
                      props.sortFields.findIndex(
                        (f) => f[0] === col.sortableKey,
                      ) === -1
                    }
                    onRowHover={props.onRowHover}
                    onRowClick={props.onRowClick}
                    columnOptions={col.columnOptions}
                    selectedRows={props.selectedRows}
                    onRowSelect={props.onRowSelect}
                    listWindow={props.listWindow}
                  />
                </ErrorBoundary>
              ))}
            </div>
          )}
          <div
            className='Table__pane Table__pane--middle'
            style={{
              width: isNaN(midPaneWidth) ? null : midPaneWidth,
            }}
          >
            {middlePaneWindow?.map((col) => {
              let index = col.colIndex;
              return (
                <ErrorBoundary key={col.key + index}>
                  <Column
                    noColumnActions={props.noColumnActions}
                    topHeader={props.topHeader}
                    showTopHeaderContent={showTopHeaderContent(
                      leftPane.length + index,
                      col.topHeader,
                    )}
                    showTopHeaderBorder={showTopHeaderContent(
                      leftPane.length + index,
                      col.topHeader,
                      true,
                    )}
                    col={col}
                    data={props.data}
                    expanded={expanded}
                    expand={expand}
                    togglePin={togglePin}
                    pinnedTo={null}
                    firstColumn={
                      index === 0 && leftPane.length === 0 && !props.multiSelect
                    }
                    width={props.columnsWidths?.[col.key]}
                    updateColumnWidth={props.updateColumnsWidths}
                    headerMeta={props.headerMeta}
                    onToggleColumnsColorScales={
                      props.onToggleColumnsColorScales
                    }
                    columnsColorScales={props.columnsColorScales}
                    isAlwaysVisible={props.alwaysVisibleColumns?.includes(
                      col.key,
                    )}
                    hideColumn={() =>
                      props.setExcludedFields?.([
                        ...(props.excludedFields || []),
                        col.key,
                      ])
                    }
                    paneFirstColumn={index === 0}
                    paneLastColumn={index === middlePane.length - 1}
                    moveColumn={(dir) =>
                      moveColumn(col.key, 'middle', index, dir)
                    }
                    sortable={
                      col.sortableKey &&
                      props.sortFields.findIndex(
                        (f) => f[0] === col.sortableKey,
                      ) === -1
                    }
                    rowHeightMode={props.rowHeightMode}
                    onRowHover={props.onRowHover}
                    onRowClick={props.onRowClick}
                    columnOptions={col.columnOptions}
                    selectedRows={props.selectedRows}
                    setColWidth={(width) =>
                      setColWidths((cW) => {
                        return cW?.[index] === width
                          ? cW
                          : { ...cW, [index]: width };
                      })
                    }
                    colLeft={colLefts[index] ?? null}
                    listWindow={props.listWindow}
                  />
                </ErrorBoundary>
              );
            })}
          </div>
          {rightPane.length > 0 && (
            <div className='Table__pane Table__pane--right'>
              {rightPane.map((col, index) => (
                <ErrorBoundary key={col.key}>
                  <Column
                    noColumnActions={props.noColumnActions}
                    key={col.key}
                    topHeader={props.topHeader}
                    showTopHeaderContent={showTopHeaderContent(
                      index,
                      col.topHeader,
                    )}
                    showTopHeaderBorder={showTopHeaderContent(
                      index,
                      col.topHeader,
                      true,
                    )}
                    col={col}
                    data={props.data}
                    expanded={expanded}
                    expand={expand}
                    togglePin={togglePin}
                    pinnedTo='right'
                    firstColumn={
                      index === 0 &&
                      leftPane.length === 0 &&
                      middlePane.length === 0 &&
                      !props.multiSelect
                    }
                    width={props.columnsWidths?.[col.key]}
                    onToggleColumnsColorScales={
                      props.onToggleColumnsColorScales
                    }
                    columnsColorScales={props.columnsColorScales}
                    updateColumnWidth={props.updateColumnsWidths}
                    headerMeta={props.headerMeta}
                    rowHeightMode={props.rowHeightMode}
                    isAlwaysVisible={props.alwaysVisibleColumns?.includes(
                      col.key,
                    )}
                    hideColumn={() =>
                      props.setExcludedFields?.([
                        ...(props.excludedFields || []),
                        col.key,
                      ])
                    }
                    paneFirstColumn={index === 0}
                    paneLastColumn={index === rightPane.length - 1}
                    moveColumn={(dir) =>
                      moveColumn(col.key, 'right', index, dir)
                    }
                    sortable={
                      col.sortableKey &&
                      props.sortFields.findIndex(
                        (f) => f[0] === col.sortableKey,
                      ) === -1
                    }
                    onRowHover={props.onRowHover}
                    onRowClick={props.onRowClick}
                    columnOptions={col.columnOptions}
                    selectedRows={props.selectedRows}
                    listWindow={props.listWindow}
                  />
                </ErrorBoundary>
              ))}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default Table;
